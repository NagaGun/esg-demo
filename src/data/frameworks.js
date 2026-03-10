const frameworks = {
    bank: {
        id: 'bank',
        label: 'My bank asked for ESG data',
        description: 'Prepare ESG data for a bank loan or financing application',
        icon: '🏦',
        requiredFields: {
            environmental: [
                {
                    id: 'electricity_kwh', label: 'Total electricity consumption',
                    unit: 'kWh/year', plain: 'How much electricity did your business use last year?',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'gas_kwh', label: 'Natural gas consumption',
                    unit: 'kWh/year', plain: 'How much natural gas did you use last year?',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'fuel_litres', label: 'Vehicle fuel consumption',
                    unit: 'litres/year', plain: 'How much fuel did your company vehicles use?',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'water_m3', label: 'Water consumption',
                    unit: 'm³/year', plain: 'How much water did your business use last year?',
                    uploadable: false, category: 'environmental'
                },
                {
                    id: 'waste_tonnes', label: 'Total waste generated',
                    unit: 'tonnes/year', plain: 'How much waste did your business generate?',
                    uploadable: true, category: 'environmental'
                }
            ],
            social: [
                {
                    id: 'employee_count', label: 'Total number of employees',
                    unit: 'number', plain: 'How many employees do you have?',
                    uploadable: false, category: 'social'
                },
                {
                    id: 'female_employees', label: 'Female employees',
                    unit: 'number', plain: 'How many of your employees are female?',
                    uploadable: false, category: 'social'
                },
                {
                    id: 'employee_turnover', label: 'Employee turnover rate',
                    unit: '%', plain: 'What percentage of employees left last year?',
                    uploadable: false, category: 'social'
                },
                {
                    id: 'injury_rate', label: 'Work-related injuries',
                    unit: 'number', plain: 'How many work-related injuries occurred last year?',
                    uploadable: false, category: 'social'
                }
            ],
            governance: [
                {
                    id: 'has_ethics_policy', label: 'Code of ethics policy',
                    unit: 'yes/no', plain: 'Do you have a written code of ethics or conduct?',
                    uploadable: false, category: 'governance'
                },
                {
                    id: 'has_privacy_policy', label: 'Data privacy policy',
                    unit: 'yes/no', plain: 'Do you have a data privacy policy?',
                    uploadable: false, category: 'governance'
                }
            ]
        }
    },

    customer: {
        id: 'customer',
        label: 'My customer asked for ESG data',
        description: 'Respond to a sustainability questionnaire from a corporate buyer',
        icon: '🤝',
        requiredFields: {
            environmental: [
                {
                    id: 'electricity_kwh', label: 'Total electricity consumption',
                    unit: 'kWh/year', plain: 'How much electricity did your business use last year?',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'gas_kwh', label: 'Natural gas consumption',
                    unit: 'kWh/year', plain: 'How much natural gas did you use?',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'scope1_emissions', label: 'Scope 1 GHG emissions',
                    unit: 'tCO2e', plain: 'Direct emissions from fuel burning (we will calculate this from your fuel bills)',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'scope2_emissions', label: 'Scope 2 GHG emissions',
                    unit: 'tCO2e', plain: 'Indirect emissions from purchased electricity (we will calculate this)',
                    uploadable: true, category: 'environmental'
                },
                {
                    id: 'renewable_energy_pct', label: 'Renewable energy percentage',
                    unit: '%', plain: 'What percentage of your energy comes from renewable sources?',
                    uploadable: false, category: 'environmental'
                }
            ],
            social: [
                {
                    id: 'employee_count', label: 'Total employees',
                    unit: 'number', plain: 'How many employees do you have?',
                    uploadable: false, category: 'social'
                },
                {
                    id: 'living_wage', label: 'Living wage commitment',
                    unit: 'yes/no', plain: 'Do all employees earn at least the local living wage?',
                    uploadable: false, category: 'social'
                },
                {
                    id: 'supplier_code', label: 'Supplier code of conduct',
                    unit: 'yes/no', plain: 'Do you have a supplier code of conduct?',
                    uploadable: false, category: 'social'
                }
            ],
            governance: [
                {
                    id: 'has_esg_policy', label: 'ESG or sustainability policy',
                    unit: 'yes/no', plain: 'Do you have a written sustainability or ESG policy?',
                    uploadable: false, category: 'governance'
                },
                {
                    id: 'has_ethics_policy', label: 'Code of ethics',
                    unit: 'yes/no', plain: 'Do you have a written code of ethics?',
                    uploadable: false, category: 'governance'
                }
            ]
        }
    },

    vsme: {
        id: 'vsme',
        label: 'I want to file a VSME report',
        description: 'Create a formal Voluntary Sustainability Report for SMEs (EFRAG VSME standard)',
        icon: '📋',
        requiredFields: {
            environmental: [
                { id: 'electricity_kwh', label: 'Total electricity consumption', unit: 'kWh/year', plain: 'Total electricity used last year', uploadable: true, category: 'environmental' },
                { id: 'gas_kwh', label: 'Natural gas consumption', unit: 'kWh/year', plain: 'Total natural gas used last year', uploadable: true, category: 'environmental' },
                { id: 'fuel_litres', label: 'Fuel consumption', unit: 'litres/year', plain: 'Total vehicle and equipment fuel used', uploadable: true, category: 'environmental' },
                { id: 'scope1_emissions', label: 'Scope 1 GHG emissions', unit: 'tCO2e', plain: 'Direct greenhouse gas emissions', uploadable: true, category: 'environmental' },
                { id: 'scope2_emissions', label: 'Scope 2 GHG emissions', unit: 'tCO2e', plain: 'Indirect emissions from electricity', uploadable: true, category: 'environmental' },
                { id: 'water_m3', label: 'Water withdrawal', unit: 'm³/year', plain: 'Total water consumed', uploadable: true, category: 'environmental' },
                { id: 'waste_tonnes', label: 'Total waste', unit: 'tonnes/year', plain: 'Total waste generated', uploadable: true, category: 'environmental' },
                { id: 'waste_recycled_pct', label: 'Waste recycled', unit: '%', plain: 'Percentage of waste that was recycled', uploadable: false, category: 'environmental' }
            ],
            social: [
                { id: 'employee_count', label: 'Total employees', unit: 'number', plain: 'Total headcount', uploadable: false, category: 'social' },
                { id: 'female_employees', label: 'Female employees', unit: 'number', plain: 'Number of female employees', uploadable: false, category: 'social' },
                { id: 'part_time_employees', label: 'Part-time employees', unit: 'number', plain: 'Number of part-time employees', uploadable: false, category: 'social' },
                { id: 'employee_turnover', label: 'Employee turnover', unit: '%', plain: 'Turnover rate last year', uploadable: false, category: 'social' },
                { id: 'training_hours', label: 'Training hours per employee', unit: 'hours', plain: 'Average training hours per employee per year', uploadable: false, category: 'social' },
                { id: 'injury_rate', label: 'Work-related injuries', unit: 'number', plain: 'Number of work-related injuries last year', uploadable: false, category: 'social' },
                { id: 'pay_gap_pct', label: 'Gender pay gap', unit: '%', plain: 'Difference in average pay between male and female employees', uploadable: false, category: 'social' }
            ],
            governance: [
                { id: 'has_ethics_policy', label: 'Code of ethics', unit: 'yes/no', plain: 'Do you have a written code of ethics?', uploadable: false, category: 'governance' },
                { id: 'has_privacy_policy', label: 'Data privacy policy', unit: 'yes/no', plain: 'Do you have a data privacy policy?', uploadable: false, category: 'governance' },
                { id: 'has_esg_policy', label: 'Sustainability policy', unit: 'yes/no', plain: 'Do you have a written sustainability policy?', uploadable: false, category: 'governance' },
                { id: 'board_female_pct', label: 'Female board members', unit: '%', plain: 'Percentage of board/leadership that is female', uploadable: false, category: 'governance' },
                { id: 'has_whistleblower', label: 'Whistleblower channel', unit: 'yes/no', plain: 'Do you have a whistleblower reporting channel?', uploadable: false, category: 'governance' }
            ]
        }
    },

    gri: {
        id: 'gri',
        label: 'GRI Standards Report',
        description: 'Global Reporting Initiative — the most widely used ESG framework worldwide',
        icon: '🌍',
        requiredFields: {
            environmental: [
                { id: 'electricity_kwh', label: 'GRI 302-1: Energy consumption within organization', unit: 'kWh/year', plain: 'Total electricity consumed last year', uploadable: true, category: 'environmental' },
                { id: 'gas_kwh', label: 'GRI 302-1: Natural gas consumption', unit: 'kWh/year', plain: 'Total natural gas consumed last year', uploadable: true, category: 'environmental' },
                { id: 'fuel_litres', label: 'GRI 302-1: Fuel consumption', unit: 'litres/year', plain: 'Total vehicle and equipment fuel', uploadable: true, category: 'environmental' },
                { id: 'renewable_energy_pct', label: 'GRI 302-1: Renewable energy percentage', unit: '%', plain: 'What percentage of energy is from renewable sources?', uploadable: false, category: 'environmental' },
                { id: 'water_m3', label: 'GRI 303-3: Water withdrawal', unit: 'm³/year', plain: 'Total water consumed', uploadable: true, category: 'environmental' },
                { id: 'scope1_emissions', label: 'GRI 305-1: Direct (Scope 1) GHG emissions', unit: 'tCO2e', plain: 'Direct emissions from fuel burning', uploadable: true, category: 'environmental' },
                { id: 'scope2_emissions', label: 'GRI 305-2: Energy indirect (Scope 2) GHG emissions', unit: 'tCO2e', plain: 'Indirect emissions from purchased electricity', uploadable: true, category: 'environmental' },
                { id: 'waste_tonnes', label: 'GRI 306-3: Waste generated', unit: 'tonnes/year', plain: 'Total waste generated', uploadable: true, category: 'environmental' },
                { id: 'waste_recycled_pct', label: 'GRI 306-4: Waste diverted from disposal', unit: '%', plain: 'Percentage of waste recycled or composted', uploadable: false, category: 'environmental' }
            ],
            social: [
                { id: 'employee_count', label: 'GRI 401-1: Total employees', unit: 'number', plain: 'Total number of employees', uploadable: false, category: 'social' },
                { id: 'female_employees', label: 'GRI 405-1: Female employees', unit: 'number', plain: 'Number of female employees', uploadable: false, category: 'social' },
                { id: 'employee_turnover', label: 'GRI 401-1: Employee turnover rate', unit: '%', plain: 'Percentage of employees who left last year', uploadable: false, category: 'social' },
                { id: 'injury_rate', label: 'GRI 403-9: Work-related injuries', unit: 'number', plain: 'Number of recordable work-related injuries', uploadable: false, category: 'social' },
                { id: 'training_hours', label: 'GRI 404-1: Average training hours per employee', unit: 'hours', plain: 'Average training hours per employee per year', uploadable: false, category: 'social' }
            ],
            governance: [
                { id: 'has_ethics_policy', label: 'GRI 205-2: Anti-corruption policies', unit: 'yes/no', plain: 'Do you have a written anti-corruption or code of ethics policy?', uploadable: false, category: 'governance' },
                { id: 'has_privacy_policy', label: 'GRI 418-1: Data privacy policy', unit: 'yes/no', plain: 'Do you have a data privacy policy?', uploadable: false, category: 'governance' }
            ]
        }
    },

    cdp: {
        id: 'cdp',
        label: 'CDP Climate Questionnaire',
        description: 'Carbon Disclosure Project — required by major corporate buyers including Walmart, Apple, and Target',
        icon: '🏭',
        requiredFields: {
            environmental: [
                { id: 'scope1_emissions', label: 'CDP C6.1: Scope 1 gross GHG emissions', unit: 'tCO2e', plain: 'Total direct emissions from fuel combustion', uploadable: true, category: 'environmental' },
                { id: 'scope2_emissions', label: 'CDP C6.3: Scope 2 location-based GHG emissions', unit: 'tCO2e', plain: 'Indirect emissions from purchased electricity', uploadable: true, category: 'environmental' },
                { id: 'electricity_kwh', label: 'CDP C8.2a: Electricity consumption', unit: 'kWh/year', plain: 'Total electricity consumed', uploadable: true, category: 'environmental' },
                { id: 'renewable_energy_pct', label: 'CDP C8.2a: Renewable electricity percentage', unit: '%', plain: 'Percentage of electricity from renewable sources', uploadable: false, category: 'environmental' },
                { id: 'fuel_litres', label: 'CDP C8.2a: Fuel consumption', unit: 'litres/year', plain: 'Total fuel consumed by vehicles and equipment', uploadable: true, category: 'environmental' },
                { id: 'has_emissions_target', label: 'CDP C4.1: Emissions reduction target', unit: 'yes/no', plain: 'Do you have a target to reduce your emissions?', uploadable: false, category: 'environmental' }
            ],
            social: [
                { id: 'employee_count', label: 'CDP Introduction: Number of employees', unit: 'number', plain: 'Total number of employees', uploadable: false, category: 'social' }
            ],
            governance: [
                { id: 'has_climate_policy', label: 'CDP C1.1: Board oversight of climate', unit: 'yes/no', plain: 'Does your board or senior leadership oversee climate-related issues?', uploadable: false, category: 'governance' },
                { id: 'has_esg_policy', label: 'CDP C1.2: Climate-related policy', unit: 'yes/no', plain: 'Do you have a climate change or sustainability policy?', uploadable: false, category: 'governance' }
            ]
        }
    }
}

export default frameworks;

