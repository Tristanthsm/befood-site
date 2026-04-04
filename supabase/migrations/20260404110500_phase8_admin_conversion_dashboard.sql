create or replace function public.get_admin_conversion_dashboard(
    p_from timestamptz default timezone('utc', now()) - interval '30 days',
    p_to timestamptz default timezone('utc', now()),
    p_limit integer default 20
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_role text := coalesce(auth.role(), '');
    v_user_id uuid := auth.uid();
    v_is_admin boolean := false;

    v_from timestamptz;
    v_to timestamptz;
    v_limit integer := greatest(1, least(coalesce(p_limit, 20), 100));

    v_totals jsonb := '{}'::jsonb;
    v_actors jsonb := '[]'::jsonb;
begin
    if v_role <> 'service_role' then
        if v_user_id is null then
            return jsonb_build_object(
                'authorized', false,
                'message', 'Authentication required.'
            );
        end if;

        select coalesce(p.is_admin, false)
        into v_is_admin
        from public.profiles p
        where p.id = v_user_id;

        if not v_is_admin then
            return jsonb_build_object(
                'authorized', false,
                'message', 'Admin role required.'
            );
        end if;
    end if;

    v_to := coalesce(p_to, timezone('utc', now()));
    v_from := coalesce(p_from, v_to - interval '30 days');

    if v_to <= v_from then
        v_from := v_to - interval '30 days';
    end if;

    -- Garde-fou anti-requête trop large.
    if v_to - v_from > interval '180 days' then
        v_from := v_to - interval '180 days';
    end if;

    with session_scope as (
        select *
        from public.web_join_sessions w
        where w.arrived_at >= v_from
          and w.arrived_at < v_to
    ),
    acquisition_scope as (
        select *
        from public.user_acquisitions ua
        where ua.created_at >= v_from
          and ua.created_at < v_to
          and ua.acquisition_type = 'coach'
    )
    select jsonb_build_object(
        'join_sessions', (select count(*)::integer from session_scope),
        'app_store_clicks', (select count(*)::integer from session_scope where app_store_clicked_at is not null),
        'attributed_sessions', (select count(*)::integer from session_scope where reconciliation_status = 'attributed'),
        'sessions_with_coach_code', (select count(*)::integer from session_scope where coach_code is not null and coach_code <> ''),
        'sessions_without_actor_match', (
            select count(*)::integer
            from session_scope
            where coach_profile_user_id is null
              and coach_code is not null
              and coach_code <> ''
        ),
        'acquisitions_backend', (select count(*)::integer from acquisition_scope)
    )
    into v_totals;

    with session_actor as (
        select
            w.coach_profile_user_id,
            count(*)::integer as join_sessions,
            count(*) filter (where w.app_store_clicked_at is not null)::integer as app_store_clicks,
            count(*) filter (where w.reconciliation_status = 'attributed')::integer as attributed_sessions
        from public.web_join_sessions w
        where w.arrived_at >= v_from
          and w.arrived_at < v_to
          and w.coach_profile_user_id is not null
        group by w.coach_profile_user_id
    ),
    acquisition_actor as (
        select
            ua.referrer_id as coach_profile_user_id,
            count(*)::integer as acquisitions_backend
        from public.user_acquisitions ua
        where ua.created_at >= v_from
          and ua.created_at < v_to
          and ua.acquisition_type = 'coach'
          and ua.referrer_id is not null
        group by ua.referrer_id
    ),
    latest_request as (
        select distinct on (cr.user_id)
            cr.user_id,
            lower(coalesce(cr.profile_type, '')) as profile_type
        from public.coach_requests cr
        where cr.user_id is not null
        order by cr.user_id, cr.updated_at desc nulls last, cr.created_at desc nulls last
    ),
    actor_rows as (
        select
            cp.user_id,
            coalesce(nullif(cp.business_name, ''), 'Profil BeFood') as business_name,
            cp.invite_code,
            p.email,
            case
                when lr.profile_type = 'createur' then 'createur'
                else 'coach'
            end as profile_type,
            coalesce(sa.join_sessions, 0) as join_sessions,
            coalesce(sa.app_store_clicks, 0) as app_store_clicks,
            coalesce(sa.attributed_sessions, 0) as attributed_sessions,
            coalesce(aa.acquisitions_backend, 0) as acquisitions_backend
        from public.coach_profiles cp
        left join public.profiles p
            on p.id = cp.user_id
        left join latest_request lr
            on lr.user_id = cp.user_id
        left join session_actor sa
            on sa.coach_profile_user_id = cp.user_id
        left join acquisition_actor aa
            on aa.coach_profile_user_id = cp.user_id
    ),
    ranked as (
        select *
        from actor_rows
        where join_sessions > 0
           or app_store_clicks > 0
           or acquisitions_backend > 0
        order by join_sessions desc, app_store_clicks desc, acquisitions_backend desc, business_name asc
        limit v_limit
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'user_id', r.user_id,
                'business_name', r.business_name,
                'invite_code', r.invite_code,
                'email', r.email,
                'profile_type', r.profile_type,
                'join_sessions', r.join_sessions,
                'app_store_clicks', r.app_store_clicks,
                'attributed_sessions', r.attributed_sessions,
                'acquisitions_backend', r.acquisitions_backend
            )
            order by r.join_sessions desc, r.app_store_clicks desc, r.acquisitions_backend desc, r.business_name asc
        ),
        '[]'::jsonb
    )
    into v_actors
    from ranked r;

    return jsonb_build_object(
        'authorized', true,
        'range', jsonb_build_object(
            'from', v_from,
            'to', v_to
        ),
        'totals', v_totals,
        'actors', v_actors
    );
end;
$$;

revoke all on function public.get_admin_conversion_dashboard(timestamptz, timestamptz, integer) from public;
grant execute on function public.get_admin_conversion_dashboard(timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.get_admin_conversion_dashboard(timestamptz, timestamptz, integer) to service_role;
