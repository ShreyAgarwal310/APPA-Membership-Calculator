// ======================
// Global Variables
// ======================

// Store the fee matrix dynamically
let feeMatrix = {};

// Store GIE options for four-year institutions
let gieOptions = [];

// Store non-higher education fees
let nonHigherEdFees = new Map();

// Store business partner fees
let businessPartnerFees = new Map();

// Store regional fee multipliers
let regionMultipliers = {};

// FTE options for four-year institutions
let fteOptions = [];

// FTE index mapping
let fteIndexMap = {};

// Two-year GIE options and fees
let twoYearGieOptions = [];

// Business Partner levels
let businessPartnerLevels = [];

// Regions
let regions = [];

// ======================
// Helper Functions
// ======================

/**
 * Populates a dropdown with options.
 * @param {string} id - The ID of the dropdown.
 * @param {Array} options - The options to populate.
 */
function populateDropdown(id, options) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = options
        .map(option => `<option value="${option.value || option}">${option.label || option}</option>`)
        .join('');
}

/**
 * Clears the content of a dropdown.
 * @param {string} id - The ID of the dropdown.
 */
function clearDropdown(id) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = ''; // Clear the dropdown content
}

/**
 * Gets the non-higher education fee based on the institution type.
 * @param {string} institutionType - The type of institution.
 * @returns {number} - The fee for the institution type.
 */
function getNonHigherEdFee(institutionType) {
    return nonHigherEdFees.get(institutionType) || 0;
}

/**
 * Gets the business partner fee based on the level.
 * @param {string} level - The business partner level.
 * @returns {number} - The fee for the business partner level.
 */
function getBusinessPartnerFee(level) {
    return businessPartnerFees.get(level) || 0;
}

/**
 * Gets the regional fee based on the region and base fee.
 * @param {string} region - The selected region.
 * @param {number} baseFee - The base fee to calculate the regional fee from.
 * @returns {number} - The regional fee.
 */
function getRegionalFee(region, baseFee) {
    return Math.ceil(baseFee * (regionMultipliers[region] || 0));
}

/**
 * Gets the four-year fee based on FTE and GIE.
 * @param {string} fie - The selected FTE range.
 * @param {string} gie - The selected GIE range.
 * @returns {number} - The fee for the four-year institution.
 */
function getFourYearFee(fie, gie) {
    if (!feeMatrix[gie]) return 0; // Check if the GIE range is valid
    const fieIndex = fteIndexMap[fie] || 0; // Use the FTE index mapping
    return feeMatrix[gie][fieIndex] || 0;
}

/**
 * Gets the two-year fee based on GIE.
 * @param {string} gie - The selected GIE range.
 * @returns {number} - The fee for the two-year institution.
 */
function getTwoYearFee(gie) {
    const selectedOption = twoYearGieOptions.find(option => option.value === gie);
    return selectedOption ? selectedOption.fee : 0;
}

// ======================
// Event Handlers
// ======================

/**
 * Handles changes to the institution type dropdown.
 */
function handleInstitutionTypeChange() {
    const type = document.getElementById('institutionType').value;

    // Clear all dropdowns first
    clearDropdown('fie');
    clearDropdown('gie');
    clearDropdown('gieTwoYear');
    clearDropdown('businessLevel');
    clearDropdown('region');

    // Disable all dropdowns by default
    document.getElementById('fie').disabled = true;
    document.getElementById('gie').disabled = true;
    document.getElementById('gieTwoYear').disabled = true;
    document.getElementById('businessLevel').disabled = true;

    // Enable/Disable dropdowns based on institution type
    if (type === 'four-year') {
        document.getElementById('fie').disabled = false;
        document.getElementById('gie').disabled = false;
        populateDropdown('fie', fteOptions);
        populateDropdown('gie', gieOptions);
        document.getElementById('region').disabled = false; // Enable region dropdown
        populateDropdown('region', regions); // Populate region dropdown
    } else if (type === 'two-year') {
        document.getElementById('gieTwoYear').disabled = false;
        populateDropdown('gieTwoYear', twoYearGieOptions.map(option => option.value));
        document.getElementById('region').disabled = false; // Enable region dropdown
        populateDropdown('region', regions); // Populate region dropdown
    } else if (type === 'business-partner') {
        document.getElementById('businessLevel').disabled = false;
        document.getElementById('region').disabled = true; // Disable region dropdown for business partner
        populateDropdown('businessLevel', businessPartnerLevels);
    } else {
        document.getElementById('region').disabled = false; // Enable region dropdown for other types
        populateDropdown('region', regions); // Populate region dropdown
    }
}

// ======================
// Main Logic
// ======================

/**
 * Calculates the total fee based on user inputs.
 */
function calculateFee() {
    // Get the selected institution type
    const institutionType = document.getElementById('institutionType').value;
    let nationalFee = 0;

    // Calculate national fee based on institution type
    if (institutionType === 'four-year') {
        const fie = document.getElementById('fie').value;
        const gie = document.getElementById('gie').value;

        // Check if both FTE and GIE are selected
        if (!fie || !gie) {
            alert('Please select both FTE and GIE for four-year institutions.');
            return;
        }

        // Calculate the national fee based on FTE and GIE
        nationalFee = getFourYearFee(fie, gie);
    } else if (institutionType === 'two-year') {
        const gieTwoYear = document.getElementById('gieTwoYear').value;

        // Check if GIE is selected
        if (!gieTwoYear) {
            alert('Please select GIE for two-year institutions.');
            return;
        }

        // Calculate the national fee based on GIE
        nationalFee = getTwoYearFee(gieTwoYear);
    } else if (institutionType === 'business-partner') {
        const businessLevel = document.getElementById('businessLevel').value;

        // Check if business level is selected
        if (!businessLevel) {
            alert('Please select a business level.');
            return;
        }

        // Calculate the national fee based on business level
        nationalFee = getBusinessPartnerFee(businessLevel);
    } else {
        nationalFee = getNonHigherEdFee(institutionType);
    }

    // Calculate regional fee if applicable
    let regionalFee = 0;
    if (institutionType !== 'business-partner') {
        const region = document.getElementById('region').value;

        // Check if region is selected
        if (!region) {
            alert('Please select a region.');
            return;
        }

        regionalFee = getRegionalFee(region, nationalFee);
    }

    // Calculate total fee
    const totalFee = nationalFee + regionalFee;

    // Update the result section
    document.getElementById('nationalFee').textContent = `National Fee: $${nationalFee.toFixed(2)}`;
    document.getElementById('regionalFee').textContent = `Regional Fee: $${regionalFee.toFixed(2)}`;
    document.getElementById('totalFee').textContent = `Total Fee: $${totalFee.toFixed(2)}`;
}

// ======================
// Initialization
// ======================

/**
 * Parses a section of the CSV file based on the header.
 * @param {Array} rows - The rows of the CSV file.
 * @param {string} header - The header of the section to parse.
 * @returns {Array} - The rows of the section.
 */
function parseSection(rows, header) {
    const startIndex = rows.findIndex(row => row[0] === header);
    if (startIndex === -1) return []; // Header not found

    const sectionRows = [];
    for (let i = startIndex + 1; i < rows.length; i++) { // Start from the row after the header
        if (rows[i].length === 0 || rows[i].every(cell => cell === '')) break; // Stop at blank line
        sectionRows.push(rows[i]);
    }

    return sectionRows;
}

// Fetch and populate the fee matrix and other data from the CSV
fetch('APPA Membership Costs.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        // Parse the four-year institution fees
        const fourYearRows = parseSection(rows, "Four-Year Institution Fees");
        gieOptions = fourYearRows.map(row => row[0]);
        fourYearRows.forEach(row => {
            const gie = row[0];
            feeMatrix[gie] = row.slice(1).map(Number);
        });

        // Parse FTE options and index mapping
        fteOptions = rows[rows.findIndex(row => row[0] === "Four-Year Institution Fees") + 1].slice(1);
        fteIndexMap = fteOptions.reduce((acc, val, index) => {
            acc[val] = index;
            return acc;
        }, {});

        // Parse two-year GIE options and fees
        const twoYearRows = parseSection(rows, "Two-Year Institution Fees");
        twoYearGieOptions = twoYearRows.map(row => ({
            value: row[0],
            fee: Number(row[1])
        }));

        // Parse non-higher education fees
        const nonHigherEdRows = parseSection(rows, "Non-Higher Education Fees");
        nonHigherEdRows.forEach(row => {
            nonHigherEdFees.set(row[0], Number(row[1]));
        });

        // Parse business partner fees
        const businessPartnerRows = parseSection(rows, "Business Partner Fees");
        businessPartnerLevels = businessPartnerRows.map(row => ({
            value: row[0],
            label: row[0].charAt(0).toUpperCase() + row[0].slice(1) // Capitalize the first letter
        }));
        businessPartnerRows.forEach(row => {
            businessPartnerFees.set(row[0], Number(row[1]));
        });

        // Parse regional fee multipliers
        const regionalMultiplierRows = parseSection(rows, "Regional Fee Multipliers");
        regions = regionalMultiplierRows.map(row => ({
            value: row[0],
            label: row[0] // Use the region code as both value and label
        }));
        regionalMultiplierRows.forEach(row => {
            regionMultipliers[row[0]] = Number(row[1]);
        });

        // Initialize the form with the default settings
        handleInstitutionTypeChange();
    });

// Set up event listeners
document.getElementById('institutionType').addEventListener('change', handleInstitutionTypeChange);
document.addEventListener('DOMContentLoaded', handleInstitutionTypeChange);