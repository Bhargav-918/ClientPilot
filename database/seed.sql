-- =============================================================================
-- CLIENTPILOT SEED DATA
-- Hack With Hyderabad 3.0: Realistic Client Interactions Demonstrating Memory Progression
-- =============================================================================

-- Clean up
DELETE FROM interactions;
DELETE FROM clients;

-- -----------------------------------------------------------------------------
-- 1. CLIENT: Rahul Sharma (Primary Hackathon Demo Case)
-- -----------------------------------------------------------------------------
INSERT INTO clients (id, name, company, industry, email, phone, project, created_at, updated_at)
VALUES (
    'c1',
    'Rahul Sharma',
    'GreenLeaf Foods',
    'Food Manufacturing',
    'rahul@greenleaffoods.in',
    '+91 98201 44520',
    'E-commerce Website',
    '2026-09-20 10:00:00+00',
    '2026-09-25 16:30:00+00'
);

-- Interactions for Rahul showing learning progression:
-- Interaction 1: Initial Need
INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
VALUES (
    'i1',
    'c1',
    'REQUIREMENT',
    'Rahul from GreenLeaf Foods wants an e-commerce website to sell organic farm products directly to consumers.',
    '2026-09-20 10:00:00+00',
    '2026-09-20 10:05:00+00'
);

-- Interaction 2: Preferences and Budget Cap
INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
VALUES (
    'i2',
    'c1',
    'NOTE',
    'Rahul wants WhatsApp integration for order tracking and wants the project to stay strictly within a budget of ₹2 lakh.',
    '2026-09-22 14:30:00+00',
    '2026-09-22 14:35:00+00'
);

-- Interaction 3: Critical Past Objection & Proposal Rejection
INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
VALUES (
    'i3',
    'c1',
    'COMPLAINT',
    'Rahul rejected our previous proposal because the implementation cost was too high (quoted ₹3.8 lakh) and lacked clear payment milestones.',
    '2026-09-24 16:00:00+00',
    '2026-09-24 16:10:00+00'
);

-- -----------------------------------------------------------------------------
-- 2. CLIENT: Priya Nair (Enterprise SaaS Persona)
-- -----------------------------------------------------------------------------
INSERT INTO clients (id, name, company, industry, email, phone, project, created_at, updated_at)
VALUES (
    'c2',
    'Priya Nair',
    'TechNova Solutions',
    'Enterprise IT / Cloud Services',
    'priya.nair@technova.io',
    '+91 99302 77119',
    'Cloud Migration & Security Audit',
    '2026-09-15 09:30:00+00',
    '2026-09-24 14:15:00+00'
);

INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
VALUES (
    'i4',
    'c2',
    'MEETING',
    'Initial discovery call with Priya. Team needs SOC2 compliance checklist, multi-region AWS setup, and zero-downtime database migration.',
    '2026-09-15 11:00:00+00',
    '2026-09-15 11:30:00+00'
),
(
    'i5',
    'c2',
    'REQUIREMENT',
    'Priya strongly prefers asynchronous communication via Slack over recurring video calls. Emphasized quarterly security reviews.',
    '2026-09-19 09:15:00+00',
    '2026-09-19 09:20:00+00'
);

-- -----------------------------------------------------------------------------
-- 3. CLIENT: Arjun Mehta (Omnichannel Retail Persona)
-- -----------------------------------------------------------------------------
INSERT INTO clients (id, name, company, industry, email, phone, project, created_at, updated_at)
VALUES (
    'c3',
    'Arjun Mehta',
    'ABC Retail',
    'Omnichannel Retail',
    'arjun@abcretail.co',
    '+91 98450 12890',
    'Inventory Sync Mobile App',
    '2026-09-18 11:00:00+00',
    '2026-09-23 12:00:00+00'
);

INSERT INTO interactions (id, client_id, type, content, interaction_date, created_at)
VALUES (
    'i6',
    'c3',
    'CALL',
    'Arjun reported POS sync delays during weekend peak retail hours. Needs barcode scanner support for Zebra Android handhelds.',
    '2026-09-18 15:00:00+00',
    '2026-09-18 15:15:00+00'
),
(
    'i7',
    'c3',
    'NOTE',
    'Arjun requested an offline-first caching layer so cash registers keep billing even during internet outages.',
    '2026-09-21 17:00:00+00',
    '2026-09-21 17:10:00+00'
);
