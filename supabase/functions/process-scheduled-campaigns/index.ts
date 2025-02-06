
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

    console.log('Starting scheduled campaign processing...')
    const now = new Date()
    console.log('Current server time:', now.toISOString())

    // Get all scheduled campaigns that haven't exceeded retry limit
    const { data: campaignsToProcess, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lt('retry_count', 3)

    if (fetchError) {
      console.error('Error fetching scheduled campaigns:', fetchError)
      throw fetchError
    }

    console.log(`Found ${campaignsToProcess?.length || 0} total scheduled campaigns`)
    console.log('All scheduled campaigns:', campaignsToProcess)

    // Filter campaigns that are due to be sent
    const dueCampaigns = campaignsToProcess?.filter(campaign => {
      const scheduledFor = new Date(campaign.scheduled_for)
      const isDue = scheduledFor <= now
      console.log(`Campaign ${campaign.id}:`, {
        scheduledFor: scheduledFor.toISOString(),
        currentTime: now.toISOString(),
        isDue,
        timezone: campaign.timezone,
        retryCount: campaign.retry_count
      })
      return isDue
    }) || []

    console.log(`Found ${dueCampaigns.length} campaigns due to be sent`)
    console.log('Due campaigns:', dueCampaigns)

    if (dueCampaigns.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'No campaigns due for processing' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Process each campaign
    const processPromises = dueCampaigns.map(async (campaign) => {
      try {
        console.log(`Processing campaign ${campaign.id}...`)
        console.log('Campaign details:', {
          id: campaign.id,
          name: campaign.name,
          scheduledFor: campaign.scheduled_for,
          timezone: campaign.timezone,
          retryCount: campaign.retry_count
        })
        
        // Call the send-campaign function
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-campaign`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({ campaignId: campaign.id }),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error response from send-campaign:`, errorText)
          throw new Error(`Failed to send campaign: ${errorText}`)
        }

        const result = await response.json()
        console.log(`Successfully processed campaign ${campaign.id}`, result)
      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error)
        
        // Update campaign status to failed if retry limit reached
        if (campaign.retry_count >= 2) {
          const { error: updateError } = await supabaseClient
            .from('campaigns')
            .update({ 
              status: 'failed',
              error_log: `Max retries reached. Last error: ${error.message}`,
              retry_count: campaign.retry_count + 1
            })
            .eq('id', campaign.id)

          if (updateError) {
            console.error(`Error updating failed campaign status:`, updateError)
          }
        }
        
        throw error
      }
    })

    await Promise.all(processPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: dueCampaigns.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in process-scheduled-campaigns:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
