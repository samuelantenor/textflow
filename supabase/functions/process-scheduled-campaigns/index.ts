
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

    // Get only scheduled campaigns that haven't been sent yet
    const { data: campaignsToProcess, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .eq('processing_status', 'pending') // Only get campaigns that are still pending
      .lte('scheduled_for', now.toISOString()) // Only get campaigns scheduled for now or earlier

    if (fetchError) {
      console.error('Error fetching scheduled campaigns:', fetchError)
      throw fetchError
    }

    console.log(`Found ${campaignsToProcess?.length || 0} campaigns to process`)
    console.log('Campaigns to process:', campaignsToProcess)

    if (!campaignsToProcess || campaignsToProcess.length === 0) {
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
    const processPromises = campaignsToProcess.map(async (campaign) => {
      try {
        console.log(`Processing campaign ${campaign.id}...`)
        
        // First mark the campaign as processing to prevent duplicate sends
        const { error: updateError } = await supabaseClient
          .from('campaigns')
          .update({ 
            processing_status: 'processing',
            status: 'processing'
          })
          .eq('id', campaign.id)

        if (updateError) {
          console.error(`Error updating campaign ${campaign.id} status:`, updateError)
          throw updateError
        }
        
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
        // Update campaign status to error if something went wrong
        await supabaseClient
          .from('campaigns')
          .update({ 
            processing_status: 'error',
            status: 'error'
          })
          .eq('id', campaign.id)
        throw error
      }
    })

    await Promise.all(processPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: campaignsToProcess.length 
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
