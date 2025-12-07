-- Assign appropriate prescribed activities to each intent draft

-- Port Moresby Combined Cycle Power Station -> 10.2: Operation of fuel burning power stations with capacity > 5MW
UPDATE intent_registration_drafts
SET prescribed_activity_id = 'c2494654-f0d0-4aaa-8fc1-32e226a74653',
    activity_level = 'Level 2'
WHERE id = '3dc03a5c-e1c6-4d82-bc44-64dd35c47032';

-- Markham Valley Oil Exploration -> 1.1: Drilling of oil and gas wells
UPDATE intent_registration_drafts
SET prescribed_activity_id = '52d91592-17d0-498c-af9d-02915b22942c',
    activity_level = 'Level 2'
WHERE id = '3c85574f-7b84-4c61-8b68-bc3c9db75751';

-- Lae City Sewage Treatment Plant -> 11.1: Sewage treatment in plants serving > 5,000 people
UPDATE intent_registration_drafts
SET prescribed_activity_id = 'a3d3147d-d793-48fa-bd60-ee069f394717',
    activity_level = 'Level 2'
WHERE id = '958dacea-d78f-4578-92c2-c799d467b293';

-- Porgera Gold Mine Tailings Management -> 17.1: Mining activities requiring Special Mining Lease
UPDATE intent_registration_drafts
SET prescribed_activity_id = 'f704d414-10e5-4d70-92a2-1382526381a1',
    activity_level = 'Level 3'
WHERE id = 'f43b31c3-dba5-4baf-b7fc-fb5e4c67befb';