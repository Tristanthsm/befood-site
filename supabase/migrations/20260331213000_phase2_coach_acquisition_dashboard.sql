create or replace function public.get_my_coach_acquisition_dashboard(
    p_from timestamptz default timezone('utc', now()) - interval '30 days',
    p_to timestamptz default timezone('utc', now())
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_user_id uuid := auth.uid();
    v_is_coach boolean := false;
    v_from timestamptz;
    v_to timestamptz;

    v_join_sessions integer := 0;
    v_app_store_clicks integer := 0;
    v_acquisitions_coach integer := 0;
    v_active_linked_users integer := 0;

    v_daily jsonb := '[]'::jsonb;
    v_recent_events jsonb := '[]'::jsonb;
begin
    if v_user_id is null then
        return jsonb_build_object(
            'is_coach', false,
            'range', jsonb_build_object('from', null, 'to', null),
            'kpi', jsonb_build_object(
                'join_sessions', 0,
                'app_store_clicks', 0,
                'acquisitions_coach', 0,
                'active_linked_users', 0
            ),
            'funnel', jsonb_build_object(
                'traffic_coach', 0,
                'join_sessions', 0,
                'store_clicks', 0,
                'acquisitions_known_backend', 0,
                'active_coach_links', 0
            ),
            'daily', '[]'::jsonb,
            'recent_events', '[]'::jsonb
        );
    end if;

    select exists(
        select 1
        from public.coach_profiles cp
        where cp.user_id = v_user_id
    ) into v_is_coach;

    if not v_is_coach then
        return jsonb_build_object(
            'is_coach', false,
            'range', jsonb_build_object('from', null, 'to', null),
            'kpi', jsonb_build_object(
                'join_sessions', 0,
                'app_store_clicks', 0,
                'acquisitions_coach', 0,
                'active_linked_users', 0
            ),
            'funnel', jsonb_build_object(
                'traffic_coach', 0,
                'join_sessions', 0,
                'store_clicks', 0,
                'acquisitions_known_backend', 0,
                'active_coach_links', 0
            ),
            'daily', '[]'::jsonb,
            'recent_events', '[]'::jsonb
        );
    end if;

    v_to := coalesce(p_to, timezone('utc', now()));
    v_from := coalesce(p_from, v_to - interval '30 days');

    if v_to <= v_from then
        v_from := v_to - interval '30 days';
    end if;

    -- Garde-fou: fenêtre max 90 jours pour éviter les requêtes trop lourdes.
    if v_to - v_from > interval '90 days' then
        v_from := v_to - interval '90 days';
    end if;

    select count(*)
    into v_join_sessions
    from public.web_join_sessions w
    where w.coach_profile_user_id = v_user_id
      and w.arrived_at >= v_from
      and w.arrived_at < v_to;

    select count(*)
    into v_app_store_clicks
    from public.web_join_sessions w
    where w.coach_profile_user_id = v_user_id
      and w.app_store_clicked_at is not null
      and w.app_store_clicked_at >= v_from
      and w.app_store_clicked_at < v_to;

    select count(*)
    into v_acquisitions_coach
    from public.user_acquisitions ua
    where ua.referrer_id = v_user_id
      and ua.acquisition_type = 'coach'
      and ua.created_at >= v_from
      and ua.created_at < v_to;

    select count(*)
    into v_active_linked_users
    from public.coach_assignments ca
    where ca.coach_id = v_user_id
      and ca.status = 'active';

    with days as (
        select generate_series(
            date_trunc('day', v_from),
            date_trunc('day', v_to),
            interval '1 day'
        ) as day
    ),
    joins as (
        select
            date_trunc('day', w.arrived_at) as day,
            count(*)::integer as join_sessions
        from public.web_join_sessions w
        where w.coach_profile_user_id = v_user_id
          and w.arrived_at >= v_from
          and w.arrived_at < v_to
        group by date_trunc('day', w.arrived_at)
    ),
    store as (
        select
            date_trunc('day', w.app_store_clicked_at) as day,
            count(*)::integer as app_store_clicks
        from public.web_join_sessions w
        where w.coach_profile_user_id = v_user_id
          and w.app_store_clicked_at is not null
          and w.app_store_clicked_at >= v_from
          and w.app_store_clicked_at < v_to
        group by date_trunc('day', w.app_store_clicked_at)
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'day', to_char(days.day, 'YYYY-MM-DD'),
                'join_sessions', coalesce(joins.join_sessions, 0),
                'app_store_clicks', coalesce(store.app_store_clicks, 0)
            )
            order by days.day
        ),
        '[]'::jsonb
    )
    into v_daily
    from days
    left join joins on joins.day = days.day
    left join store on store.day = days.day;

    with events as (
        select
            w.arrived_at,
            w.coach_code,
            w.ref,
            w.utm_source,
            w.utm_medium,
            w.utm_campaign,
            w.app_store_clicked_at is not null as store_clicked,
            w.session_status,
            w.reconciliation_status
        from public.web_join_sessions w
        where w.coach_profile_user_id = v_user_id
          and w.arrived_at >= v_from
          and w.arrived_at < v_to
        order by w.arrived_at desc
        limit 12
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'occurred_at', events.arrived_at,
                'coach_code', events.coach_code,
                'ref', events.ref,
                'utm_source', events.utm_source,
                'utm_medium', events.utm_medium,
                'utm_campaign', events.utm_campaign,
                'store_clicked', events.store_clicked,
                'session_status', events.session_status,
                'reconciliation_status', events.reconciliation_status
            )
            order by events.arrived_at desc
        ),
        '[]'::jsonb
    )
    into v_recent_events
    from events;

    return jsonb_build_object(
        'is_coach', true,
        'range', jsonb_build_object(
            'from', v_from,
            'to', v_to
        ),
        'kpi', jsonb_build_object(
            'join_sessions', v_join_sessions,
            'app_store_clicks', v_app_store_clicks,
            'acquisitions_coach', v_acquisitions_coach,
            'active_linked_users', v_active_linked_users
        ),
        'funnel', jsonb_build_object(
            'traffic_coach', v_join_sessions,
            'join_sessions', v_join_sessions,
            'store_clicks', v_app_store_clicks,
            'acquisitions_known_backend', v_acquisitions_coach,
            'active_coach_links', v_active_linked_users
        ),
        'daily', v_daily,
        'recent_events', v_recent_events
    );
end;
$$;

revoke all on function public.get_my_coach_acquisition_dashboard(timestamptz, timestamptz) from public;
grant execute on function public.get_my_coach_acquisition_dashboard(timestamptz, timestamptz) to authenticated;
