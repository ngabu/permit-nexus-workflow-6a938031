-- Insert prescribed activities from Environment (Prescribed Activities) Regulation 2002

-- Level 2 Category A Activities
-- Sub-Category 1: Petroleum Exploration
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('1.1', 'Category A', 2, 'Petroleum Exploration', 'Drilling of oil and gas wells.');

-- Sub-Category 2: Mineral Exploration and Mining
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('2.1', 'Category A', 2, 'Mineral Exploration and Mining', 'Any drilling program at a defined prospect where the aggregate depth of all holes drilled is greater than 2,500 metres.'),
('2.2', 'Category A', 2, 'Mineral Exploration and Mining', 'Mechanised mining on a Mining Lease issued under the Mining Act 1992 involving non-chemical processing of no greater than 50,000 tonnes per annum.'),
('2.3', 'Category A', 2, 'Mineral Exploration and Mining', 'Gravel extraction operating continuously for more than 6 months and involving the extraction of no greater than 10,000 tonnes per annum.'),
('2.4', 'Category A', 2, 'Mineral Exploration and Mining', 'Quarrying involving the extraction of no greater than 100,000 tonnes per annum.');

-- Sub-Category 3: Minor Forest Activities
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('3.1', 'Category A', 2, 'Minor Forest Activities', 'Activities carried out under a Timber Authority issued under the Forest Act.');

-- Level 2 Category B Activities
-- Sub-Category 4: Manufacturing and chemical processes
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('4.1', 'Category B', 2, 'Manufacturing and chemical processes', 'Cement clinker manufacturing and grinding.'),
('4.2', 'Category B', 2, 'Manufacturing and chemical processes', 'Manufacture of products by any chemical process in works designed to produce more than 100 tonnes per year of chemical products.'),
('4.3', 'Category B', 2, 'Manufacturing and chemical processes', 'Manufacture of fibre-reinforced plastic (FRP) in works with a capacity of more than 50 tonnes per year.'),
('4.4', 'Category B', 2, 'Manufacturing and chemical processes', 'Manufacture of acrylic compounds, fertilisers, herbicides, insecticides or pesticides by any chemical process.'),
('4.5', 'Category B', 2, 'Manufacturing and chemical processes', 'Manufacturing operations involving the use of toluene di-isocyanate, methylene di-isocyanate, chlorofluorocarbons and halons.');

-- Sub-Category 5: Activities involving petroleum or chemicals
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('5.1', 'Category B', 2, 'Activities involving petroleum or chemicals', 'Manufacturing of organic chemicals requiring a Petroleum Processing Facility Licence issued under the Oil and Gas Act 1998.'),
('5.2', 'Category B', 2, 'Activities involving petroleum or chemicals', 'Pipeline transport and storage using facilities with a holding capacity of more than 0.5 million litres.');

-- Sub-Category 6: Forestry and production of timber products
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('6.1', 'Category B', 2, 'Forestry and production of timber products', 'Activities associated with a logging operation which are or should be undertaken under a timber permit or a licence, unless such licence holder is a subcontractor of a timber permit, (including sewage disposal, camp construction including power & water reticulation, operation of machinery workshops and construction of road and other infrastructure works including wharf and ship loading and unloading facilities).'),
('6.2', 'Category B', 2, 'Forestry and production of timber products', 'Operation of stationary sawmills and treatment facilities with a production capacity of greater than 30,000 m3 per year of sawn timber.'),
('6.3', 'Category B', 2, 'Forestry and production of timber products', 'Chemical treatment of timber using copper-chrome-arsenate solutions with a capacity of greater than 100 tonnes of treated wood product per year.'),
('6.4', 'Category B', 2, 'Forestry and production of timber products', 'Processing of wood to form veneer, plywood, particleboard or fibre board.'),
('6.5', 'Category B', 2, 'Forestry and production of timber products', 'Processing of wood, wood products, waste paper or other cellulose materials to form pulp, paper or cardboard.');

-- Sub-Category 7: Mining and extraction
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('7.1', 'Category B', 2, 'Mining and extraction', 'Mechanised mining on a Mining Lease issued under the Mining Act 1992 involving chemical processing of no greater than 50,000 tonnes per annum.'),
('7.2', 'Category B', 2, 'Mining and extraction', 'Mechanised mining on a Mining Lease issued under the Mining Act 1992 involving non-chemical processing of more than 50,000 tonnes per annum.'),
('7.3', 'Category B', 2, 'Mining and extraction', 'Mineral benefication or processing other than alluvial mining in accordance with an Alluvial Mining Lease issued under the Mining Act 1992.'),
('7.4', 'Category B', 2, 'Mining and extraction', 'Quarrying involving the extraction of more than 100,000 tonnes per year.'),
('7.5', 'Category B', 2, 'Mining and extraction', 'Gravel extraction operating continuously for more than 6 months and involving the extraction of more than 10,000 tonnes per year.'),
('7.6', 'Category B', 2, 'Mining and extraction', 'Commercial salt harvesting.');

-- Sub-Category 8: Aquaculture and agriculture
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('8.1', 'Category B', 2, 'Aquaculture and agriculture', 'Intensive animal industries including the raising of cattle, sheep, pigs, poultry and crocodiles with an annual production capacity of more than 200 animal units.'),
('8.2', 'Category B', 2, 'Aquaculture and agriculture', 'Operation of livestock holding pens with a capacity of more than 2,000 animal units per year.'),
('8.3', 'Category B', 2, 'Aquaculture and agriculture', 'Operation of aquaculture facilities with a design discharge flow rate greater than 1 per day or 100 tonnes of wet product per year.'),
('8.4', 'Category B', 2, 'Aquaculture and agriculture', 'Aquaculture carried out in "open sea" (cage) operations.'),
('8.5', 'Category B', 2, 'Aquaculture and agriculture', 'Agricultural cultivation of an area greater than 1,000 hectares.');

-- Sub-Category 9: Food processing and plant product processing
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('9.1', 'Category B', 2, 'Food processing and plant product processing', 'Processing of alcoholic and non-alcoholic beverages in a plant with a design production of more than 5,000 litres per day.'),
('9.2', 'Category B', 2, 'Food processing and plant product processing', 'Operation of abattoirs and poultry processing facilities processing more than 200 animal units per year.'),
('9.3', 'Category B', 2, 'Food processing and plant product processing', 'Processing coconut oil in plants producing more than 10,000 tonnes per year.'),
('9.4', 'Category B', 2, 'Food processing and plant product processing', 'Processing of coffee or cocoa in plants producing more than 5,000 tonnes per year.'),
('9.5', 'Category B', 2, 'Food processing and plant product processing', 'Palm oil extraction and processing in plants producing more than 5,000 tonnes per year.'),
('9.6', 'Category B', 2, 'Food processing and plant product processing', 'Seafood processing operations which involve the production of more than 500 tonnes per year.'),
('9.7', 'Category B', 2, 'Food processing and plant product processing', 'Production of stock feed in mills producing more than 5000 tonnes per year.'),
('9.8', 'Category B', 2, 'Food processing and plant product processing', 'Processing of latex and rubber in operations producing more than 500 tonnes per year.'),
('9.9', 'Category B', 2, 'Food processing and plant product processing', 'Sugar refining operations with a production capacity of more than 5,000 tonnes per year.');

-- Sub-Category 10: Energy production
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('10.1', 'Category B', 2, 'Energy production', 'Operation of hydroelectric plants with a capacity of more than 2 Megawatts (MW).'),
('10.2', 'Category B', 2, 'Energy production', 'Operation of fuel burning power stations with a capacity of more than 5MW, but not including emergency generators.'),
('10.3', 'Category B', 2, 'Energy production', 'Operation of fuel burning appliances including furnaces and boilers with a rated thermal output of 20MW.');

-- Sub-Category 11: Waste treatment
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('11.1', 'Category B', 2, 'Waste treatment', 'Sewage treatment in plants serving more than an equivalent population of 5,000 people.'),
('11.2', 'Category B', 2, 'Waste treatment', 'Septic tank sludge disposal systems intended to serve an equivalent population of greater than 500 people.'),
('11.3', 'Category B', 2, 'Waste treatment', 'Operation of public and private landfills for the disposal of municipal wastes, serving a population of more than 10,000 people.'),
('11.4', 'Category B', 2, 'Waste treatment', 'Incineration, reprocessing, treatment or disposal of industrial or biomedical waste of a capacity greater than 10 tonnes per year.'),
('11.5', 'Category B', 2, 'Waste treatment', 'Operation of rendering works with a capacity of greater than 500 tonnes per year.'),
('11.6', 'Category B', 2, 'Waste treatment', 'Recycling waste material including but not limited to glass, oil, metal, paper and putrescible materials with a capacity greater than 100 tonnes per year.'),
('11.7', 'Category B', 2, 'Waste treatment', 'Commercial drum reconditioning.');

-- Sub-Category 12: Infrastructure
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('12.1', 'Category B', 2, 'Infrastructure', 'Operation of maritime construction, deballast and repair facilities designed to handle vessels of a mass of greater than 50 tonnes.'),
('12.2', 'Category B', 2, 'Infrastructure', 'Construction of marinas and boating facilities designed or used to provide moorings for more than 50 powered vessels at any one time.'),
('12.3', 'Category B', 2, 'Infrastructure', 'Operation of potable water treatment plants with a design capacity of greater than 1 million litres per day.'),
('12.4', 'Category B', 2, 'Infrastructure', 'Construction of aerodromes or airfields except unpaved airstrips more than 10 km from an urban area.'),
('12.5', 'Category B', 2, 'Infrastructure', 'Construction of new national roads.'),
('12.6', 'Category B', 2, 'Infrastructure', 'Construction of electricity transmission lines or pipelines greater than 10 km in length.'),
('12.7', 'Category B', 2, 'Infrastructure', 'Construction of housing estates with an area of more than 5 hectare.');

-- Sub-Category 13: Other activities
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('13.1', 'Category B', 2, 'Other activities', 'Damming or diversion of rivers or streams.'),
('13.2', 'Category B', 2, 'Other activities', 'Discharge of waste into water or onto land in such a way that it results in the waste entering water, except where such discharge is ancillary or incidental to, or associated with, any other activity in this Regulation in which case that category of activity will apply to the discharge of waste.'),
('13.3', 'Category B', 2, 'Other activities', 'Abstraction or use of water for commercial purposes, except where such abstraction or use is ancillary or incidental to, or associated with, any other activity in this Regulation in which case that category of activity will apply to the abstraction or use of water.'),
('13.4', 'Category B', 2, 'Other activities', 'Import or export of ozone depleting substances or pesticides.');

-- Level 3 Activities
-- Sub-Category 14: General
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('14.1', 'Level 3', 3, 'General', 'Activities involving investment of a capital cost of more than K50 million, except where such investment is made in pursuing an activity otherwise dealt with in this Regulation in which case that category of activity will apply to the investment.'),
('14.2', 'Level 3', 3, 'General', 'Activities involving the generation of a volume of liquid waste of more than 7,000,000 m3 per year (approximately 20 million litres per day).'),
('14.3', 'Level 3', 3, 'General', 'Activities that will involve the discharge, emission or deposit of hazardous contaminants, except where such discharge, emission or deposit is ancillary or incidental to, or associated with, any other activity in this Regulation in which case that category of activity will apply to the discharge, emission or deposit.'),
('14.4', 'Level 3', 3, 'General', 'Activities that may result in a significant risk of serious or material environmental harm within Wildlife Management Areas, Conservation Areas, National Parks and Protected Areas or any area declared to be protected under the provisions of an International Treaty to which Papua New Guinea is a party and which has been ratified by the Parliament of the Independent State of Papua New Guinea.');

-- Sub-Category 15: Manufacturing and processing
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('15.1', 'Level 3', 3, 'Manufacturing and processing', 'Activities involving investment of a capital cost of more than K20 million and which involve manufacturing or chemical processes not previously used in Papua New Guinea.'),
('15.2', 'Level 3', 3, 'Manufacturing and processing', 'Manufacture of hazardous contaminants, except where such manufacture is ancillary or incidental to, or associated with, any other activity in this Regulation in which case that category of activity will apply to the manufacture.');

-- Sub-Category 16: Forest harvesting and land clearance
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('16.1', 'Level 3', 3, 'Forest harvesting and land clearance', 'Logging operations where the minimum annual allowable cut is greater then 70, 0000 m3 per annum.'),
('16.2', 'Level 3', 3, 'Forest harvesting and land clearance', 'Any large scale clearing carried out under section 90 (a), (b), (c) or (d) of the Forest Act.');

-- Sub-Category 17: Mining and extraction
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('17.1', 'Level 3', 3, 'Mining and extraction', 'Mining activities which require the issue of a Special Mining Lease under the Mining Act 1992.'),
('17.2', 'Level 3', 3, 'Mining and extraction', 'Mechanised mining on a Mining Lease involving chemical processing, except where the activity falls within the ambit of a Category B, Level 2 activity.'),
('17.3', 'Level 3', 3, 'Mining and extraction', 'Extraction of off-shore coral deposits for roading, commercial lime making or similar use.'),
('17.4', 'Level 3', 3, 'Mining and extraction', 'Submarine tailings disposal.');

-- Sub-Category 18: Petroleum and gas production and processing
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('18.1', 'Level 3', 3, 'Petroleum and gas production and processing', 'Recovery, processing, storage or transportation of petroleum products requiring the issue of a Petroleum Development Licence or a Pipeline Licence under the Oil and Gas Act 1998.'),
('18.2', 'Level 3', 3, 'Petroleum and gas production and processing', 'Refining of petroleum or manufacture and processing of petrochemicals or liquefaction of natural gas requiring a Petroleum Processing Facility Licence issued under the Oil and Gas Act 1998, except where the activity falls within the ambit of a Category B, Level 2 activity.');

-- Sub-Category 19: Infrastructure construction
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('19.1', 'Level 3', 3, 'Infrastructure construction', 'Construction of major hydropower schemes or water supply reservoirs inundating an area greater than 5 km2.'),
('19.2', 'Level 3', 3, 'Infrastructure construction', 'Construction of sea ports and ship repair facilities serving ships of an individual tonnage of more than 500 tonnes.'),
('19.3', 'Level 3', 3, 'Infrastructure construction', 'Infrastructure construction that requires the reclamation of more than 5 hectares of land below the high water mark.'),
('19.4', 'Level 3', 3, 'Infrastructure construction', 'Construction of sewage treatment plants designed to serve an equivalent population of greater than 50,000.');

-- Sub-Category 20: Fisheries
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('20.1', 'Level 3', 3, 'Fisheries', 'Aquaculture operations designed to discharge a volume of waste greater than 10 million litres per day.');

-- Sub-Category 21: Waste Disposal
INSERT INTO prescribed_activities (category_number, category_type, level, sub_category, activity_description) VALUES
('21.1', 'Level 3', 3, 'Waste Disposal', 'Construction and operation of municipal landfills serving populations of more than 20,000 people.'),
('21.2', 'Level 3', 3, 'Waste Disposal', 'Construction of commercial sites for the storage, treatment, reprocessing, incineration or disposal of hazardous contaminants.');