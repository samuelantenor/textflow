
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PROCESSING_TIMEOUT_MINUTES = 5
const MAX_RETRY_COUNT = 3

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

    // Get all scheduled campaigns and stuck processing campaigns
    const timeoutThreshold = new Date(now.getTime() - (PROCESSING_TIMEOUT_MINUTES * 60 * 1000))
    
    const { data: campaignsToProcess, error: fetchError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .or(`status.eq.scheduled,and(status.eq.processing,last_processing_started.lt.${timeoutThreshold.toISOString()})`)
      .lt('retry_count', MAX_RETRY_COUNT)

    if (fetchError) {
      console.error('Error fetching scheduled campaigns:', fetchError)
      throw fetchError
    }

    console.log(`Found ${campaignsToProcess?.length || 0} campaigns to check`)

    // Filter campaigns that are due to be sent
    const dueCampaigns = campaignsToProcess?.filter(campaign => {
      const scheduledFor = new Date(campaign.scheduled_for)
      const isDue = scheduledFor <= now
      console.log(`Campaign ${campaign.id}:`, {
        scheduledFor: scheduledFor.toISOString(),
        currentTime: now.toISOString(),
        isDue,
        timezone: campaign.timezone,
        retryCount: campaign.retry_count,
        status: campaign.status,
        lastProcessingStarted: campaign.last_processing_started
      })
      return isDue
    }) || []

    console.log(`Found ${dueCampaigns.length} campaigns due for processing`)

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

        // Reset stuck processing campaigns
        if (campaign.status === 'processing') {
          console.log(`Campaign ${campaign.id} appears to be stuck in processing state. Resetting...`)
          const { error: resetError } = await supabaseClient
            .from('campaigns')
            .update({ 
              status: 'scheduled',
              retry_count: campaign.retry_count + 1,
              error_log: `Reset after being stuck in processing state for over ${PROCESSING_TIMEOUT_MINUTES} minutes`
            })
            .eq('id', campaign.id)

          if (resetError) {
            console.error(`Error resetting stuck campaign ${campaign.id}:`, resetError)
            throw resetError
          }
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
        
        // Update retry count and error log
        const newRetryCount = campaign.retry_count + 1
        const updateData = {
          retry_count: newRetryCount,
          error_log: `Attempt ${newRetryCount}: ${error.message}`
        }

        // Only mark as failed if max retries reached
        if (newRetryCount >= MAX_RETRY_COUNT) {
          updateData.status = 'failed'
        } else {
          updateData.status = 'scheduled'
        }

        const { error: updateError } = await supabaseClient
          .from('campaigns')
          .update(updateData)
          .eq('id', campaign.id)

        if (updateError) {
          console.error(`Error updating campaign status:`, updateError)
        }
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
