// On3oard CRM — hand-authored Supabase Database type.
// Mirrors supabase/migrations/0001_init.sql. When a live Supabase project exists,
// regenerate with: npx supabase gen types typescript --project-id <REF> --schema public
// and replace this file. Relationships are included so nested selects type correctly.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          industry: string | null
          size: string | null
          country: string | null
          uen: string | null
          revenue_range: string | null
          owner_id: string | null
          tags: string[] | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          industry?: string | null
          size?: string | null
          country?: string | null
          uen?: string | null
          revenue_range?: string | null
          owner_id?: string | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          industry?: string | null
          size?: string | null
          country?: string | null
          uen?: string | null
          revenue_range?: string | null
          owner_id?: string | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'companies_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          full_name: string
          job_title: string | null
          company_id: string | null
          emails: string[] | null
          phones: string[] | null
          linkedin_url: string | null
          whatsapp: string | null
          lead_source: string | null
          contact_type: string | null
          owner_id: string | null
          do_not_contact: boolean | null
          tags: string[] | null
          last_contacted_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          job_title?: string | null
          company_id?: string | null
          emails?: string[] | null
          phones?: string[] | null
          linkedin_url?: string | null
          whatsapp?: string | null
          lead_source?: string | null
          contact_type?: string | null
          owner_id?: string | null
          do_not_contact?: boolean | null
          tags?: string[] | null
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          job_title?: string | null
          company_id?: string | null
          emails?: string[] | null
          phones?: string[] | null
          linkedin_url?: string | null
          whatsapp?: string | null
          lead_source?: string | null
          contact_type?: string | null
          owner_id?: string | null
          do_not_contact?: boolean | null
          tags?: string[] | null
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contacts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contacts_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      deals: {
        Row: {
          id: string
          name: string
          company_id: string | null
          primary_contact_id: string | null
          engagement_type: string | null
          value_sgd: number | null
          probability: number | null
          close_date: string | null
          stage: string
          source: string | null
          owner_id: string | null
          priority: string | null
          lost_reason: string | null
          tags: string[] | null
          created_at: string | null
          stage_changed_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          company_id?: string | null
          primary_contact_id?: string | null
          engagement_type?: string | null
          value_sgd?: number | null
          probability?: number | null
          close_date?: string | null
          stage?: string
          source?: string | null
          owner_id?: string | null
          priority?: string | null
          lost_reason?: string | null
          tags?: string[] | null
          created_at?: string | null
          stage_changed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          company_id?: string | null
          primary_contact_id?: string | null
          engagement_type?: string | null
          value_sgd?: number | null
          probability?: number | null
          close_date?: string | null
          stage?: string
          source?: string | null
          owner_id?: string | null
          priority?: string | null
          lost_reason?: string | null
          tags?: string[] | null
          created_at?: string | null
          stage_changed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'deals_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'deals_primary_contact_id_fkey'
            columns: ['primary_contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'deals_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      activities: {
        Row: {
          id: string
          type: string
          subject: string | null
          deal_id: string | null
          contact_id: string | null
          activity_date: string | null
          duration_mins: number | null
          outcome: string | null
          next_action: string | null
          next_action_due: string | null
          notes: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          type: string
          subject?: string | null
          deal_id?: string | null
          contact_id?: string | null
          activity_date?: string | null
          duration_mins?: number | null
          outcome?: string | null
          next_action?: string | null
          next_action_due?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          subject?: string | null
          deal_id?: string | null
          contact_id?: string | null
          activity_date?: string | null
          duration_mins?: number | null
          outcome?: string | null
          next_action?: string | null
          next_action_due?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activities_deal_id_fkey'
            columns: ['deal_id']
            isOneToOne: false
            referencedRelation: 'deals'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activities_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activities_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string | null
          entity_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          entity_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          entity_type?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          id: string; name: string; brief: string; subject_line: string
          audience: string; status: string; model: string
          created_by: string | null; created_at: string | null; updated_at: string | null
        }
        Insert: {
          id?: string; name: string; brief: string; subject_line: string
          audience?: string; status?: string; model?: string
          created_by?: string | null; created_at?: string | null; updated_at?: string | null
        }
        Update: {
          id?: string; name?: string; brief?: string; subject_line?: string
          audience?: string; status?: string; model?: string
          created_by?: string | null; created_at?: string | null; updated_at?: string | null
        }
        Relationships: []
      }
      campaign_emails: {
        Row: {
          id: string; campaign_id: string; contact_id: string | null
          to_name: string; to_email: string; subject: string; body: string
          status: string; sent_at: string | null; error: string | null; created_at: string | null
        }
        Insert: {
          id?: string; campaign_id: string; contact_id?: string | null
          to_name: string; to_email: string; subject: string; body: string
          status?: string; sent_at?: string | null; error?: string | null; created_at?: string | null
        }
        Update: {
          id?: string; campaign_id?: string; contact_id?: string | null
          to_name?: string; to_email?: string; subject?: string; body?: string
          status?: string; sent_at?: string | null; error?: string | null; created_at?: string | null
        }
        Relationships: [{
          foreignKeyName: 'campaign_emails_campaign_id_fkey'
          columns: ['campaign_id']; isOneToOne: false
          referencedRelation: 'email_campaigns'; referencedColumns: ['id']
        }]
      }
      app_settings: {
        Row: {
          id: string
          stages: string[] | null
          engagement_types: string[] | null
          stale_threshold_days: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          stages?: string[] | null
          engagement_types?: string[] | null
          stale_threshold_days?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          stages?: string[] | null
          engagement_types?: string[] | null
          stale_threshold_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
