
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { campaignId } = await req.json()
    
    if (!campaignId) {
      throw new Error('Campaign ID is required')
    }

    console.log('Starting scheduled campaign process for campaign:', campaignId)

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      throw new Error(`Error fetching campaign: ${campaignError?.message}`)
    }

    console.log('Campaign details:', {
      id: campaign.id,
      scheduledFor: campaign.scheduled_for,
      timezone: campaign.timezone
    })

    if (!campaign.scheduled_for) {
      throw new Error('Campaign has no scheduled time')
    }

    // Calculate delay and validate scheduled time
    const scheduledTime = new Date(campaign.scheduled_for)
    const now = new Date()
    const delay = scheduledTime.getTime() - now.getTime()

    console.log('Calculated delay:', {
      scheduledTime: scheduledTime.toISOString(),
      currentTime: now.toISOString(),
      delayMs: delay
    })

    if (delay < 0) {
      throw new Error('Cannot schedule campaign in the past')
    }

    // Update campaign status to processing
    const { error: updateError } = await supabaseClient
      .from('campaigns')
      .update({
        status: 'scheduled',
        processing_status: 'pending',
        scheduled_job_id: crypto.randomUUID()
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error(`Error updating campaign status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Campaign scheduled successfully',
        scheduledFor: scheduledTime.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in schedule-campaign-send:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

