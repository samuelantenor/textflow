
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

    console.log('Processing scheduled campaigns...')

    // Get all campaigns that are scheduled and due to be sent
    const { data: campaignsToProcess, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())

    if (fetchError) {
      console.error('Error fetching scheduled campaigns:', fetchError)
      throw fetchError
    }

    console.log(`Found ${campaignsToProcess?.length || 0} campaigns to process`)

    // Process each campaign
    const processPromises = (campaignsToProcess || []).map(async (campaign) => {
      try {
        console.log(`Processing campaign ${campaign.id}...`)
        
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
          throw new Error(`Failed to send campaign: ${await response.text()}`)
        }

        console.log(`Successfully processed campaign ${campaign.id}`)
      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error)
        throw error
      }
    })

    await Promise.all(processPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: campaignsToProcess?.length || 0 
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
