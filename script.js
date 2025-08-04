document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, starting application...");
    
    // === GLOBAL PARAMETERS ===
    const margin = {top: 30, right: 50, bottom: 50, left: 50};
    let width, height;

    const svg = d3.select("#chart");
    console.log("SVG element:", svg.node());
    
    const chartGroup = svg.append("g");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip");

    // Data storage
    let incomeData = [];
    let raceData = [];
    let costWagesData = [];
    let stateData = [];
    let householdData = [];
    let currentStep = 0;

    // --- DATA LOADING & INITIALIZATION ---
    async function init() {
        console.log("Initializing application...");
        
        try {
            // Set initial dimensions first
            const visContainer = document.getElementById('vis');
            console.log("Visualization container:", visContainer);
            
            if (!visContainer) {
                console.error("Visualization container not found!");
                return;
            }
            
            // Calculate dimensions for right section (55% of viewport) - make it bigger
            const rightSectionWidth = window.innerWidth * 0.55;
            const availableWidth = rightSectionWidth * 0.95; // Use 95% of right section
            const availableHeight = Math.min(window.innerHeight * 0.85, 600); // Increased height
            
            width = Math.min(800, availableWidth) - margin.left - margin.right; // Increased max width
            height = Math.min(550, availableHeight) - margin.top - margin.bottom; // Increased max height
            
            console.log("Chart dimensions:", { width, height });
        
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);
           
        chartGroup.attr("transform", `translate(${margin.left},${margin.top})`);
            
            // Load all CSV files
            console.log("Loading CSV files...");
            
            // Test each file individually to see which one fails
            try {
                const income = await d3.csv("income_distribution.csv", d3.autoType);
                console.log("Income data loaded:", income.length, "records");
                incomeData = income;
            } catch (error) {
                console.error("Failed to load income_distribution.csv:", error);
                incomeData = [];
            }
            
            try {
                const race = await d3.csv("race_income_distribution.csv", d3.autoType);
                console.log("Race data loaded:", race.length, "records");
                raceData = race;
            } catch (error) {
                console.error("Failed to load race_income_distribution.csv:", error);
                raceData = [];
            }
            
            try {
                const costWages = await d3.csv("cost_vs_wages.csv", d3.autoType);
                console.log("Cost wages data loaded:", costWages.length, "records");
                costWagesData = costWages;
            } catch (error) {
                console.error("Failed to load cost_vs_wages.csv:", error);
                costWagesData = [];
            }
            
            try {
                const state = await d3.csv("state_income_distribution.csv", d3.autoType);
                console.log("State data loaded:", state.length, "records");
                stateData = state;
            } catch (error) {
                console.error("Failed to load state_income_distribution.csv:", error);
                stateData = [];
            }
            
            try {
                const household = await d3.csv("household_data.csv", d3.autoType);
                console.log("Household data loaded:", household.length, "records");
                householdData = household;
            } catch (error) {
                console.error("Failed to load household_data.csv:", error);
                householdData = [];
            }

            console.log("Data loaded:", {
                income: incomeData.length,
                race: raceData.length,
                costWages: costWagesData.length,
                state: stateData.length,
                household: householdData.length
            });
            
            // If no data loaded, create sample data
            if (incomeData.length === 0) {
                console.log("Creating sample data...");
                createSampleData();
            }
        
        setupScroll();
        setupEventListeners();
            
            // Start with empty chart
            clearChart();
            
        } catch (error) {
            console.error("Error loading data:", error);
            // Draw error chart
            drawErrorChart(error);
        }
    }

    // --- SCROLL TRIGGER LOGIC ---
    function setupScroll() {
        const steps = d3.selectAll(".step");
        console.log("Found", steps.size(), "steps");
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const step = parseInt(entry.target.dataset.step, 10);
                    console.log("Step intersecting:", step, "Current step:", currentStep);
                    if (!isNaN(step) && step !== currentStep) {
                        update(step);
                    }
                    steps.classed('active', (d, i, nodes) => nodes[i] === entry.target);
                }
            });
        }, { rootMargin: "-50% 0% -50% 0%" });

        steps.each(function() {
            observer.observe(this);
        });
    }

    // --- EVENT LISTENERS FOR INTERACTIVITY ---
    function setupEventListeners() {
        d3.select("#race-selector").on("change", () => {
            // Don't change the step, just redraw the current scene with new race
            drawScene3();
        });
    }
    
    // --- MAIN UPDATE FUNCTION ---
    function update(step) {
        currentStep = step;
        console.log("Updating to step:", step);
        
        // Hide UI elements by default
        d3.select("#race-selector").style("display", "none");

        switch(step) {
            case 1: drawScene1(); break;
            case 2: 
                d3.select("#race-selector").style("display", "block");
                drawScene3(); 
                break;
            case 3: drawScene4(); break;

            default: 
                console.log("Clearing chart");
                clearChart(); 
                break;
        }
    }

    // --- SCENE DRAWING FUNCTIONS ---

    function createSampleData() {
        console.log("Creating sample data for testing...");
        
        // Sample income distribution data
        incomeData = [
            { year: 1970, income_tier: "Low", percent_population: 0.509 },
            { year: 1970, income_tier: "Middle", percent_population: 0.475 },
            { year: 1970, income_tier: "High", percent_population: 0.016 },
            { year: 1980, income_tier: "Low", percent_population: 0.258 },
            { year: 1980, income_tier: "Middle", percent_population: 0.431 },
            { year: 1980, income_tier: "High", percent_population: 0.311 },
            { year: 1990, income_tier: "Low", percent_population: 0.398 },
            { year: 1990, income_tier: "Middle", percent_population: 0.52 },
            { year: 1990, income_tier: "High", percent_population: 0.082 },
            { year: 2000, income_tier: "Low", percent_population: 0.25 },
            { year: 2000, income_tier: "Middle", percent_population: 0.566 },
            { year: 2000, income_tier: "High", percent_population: 0.184 },
            { year: 2010, income_tier: "Low", percent_population: 0.378 },
            { year: 2010, income_tier: "Middle", percent_population: 0.461 },
            { year: 2010, income_tier: "High", percent_population: 0.161 },
            { year: 2020, income_tier: "Low", percent_population: 0.239 },
            { year: 2020, income_tier: "Middle", percent_population: 0.522 },
            { year: 2020, income_tier: "High", percent_population: 0.239 }
        ];
        
        // Sample race data
        raceData = [
            { race: "White", year: 1970, income_tier: "Low", percent_population: 0.338 },
            { race: "White", year: 1970, income_tier: "Middle", percent_population: 0.423 },
            { race: "White", year: 1970, income_tier: "High", percent_population: 0.239 },
            { race: "White", year: 2020, income_tier: "Low", percent_population: 0.214 },
            { race: "White", year: 2020, income_tier: "Middle", percent_population: 0.498 },
            { race: "White", year: 2020, income_tier: "High", percent_population: 0.288 },
            { race: "Black", year: 1970, income_tier: "Low", percent_population: 0.251 },
            { race: "Black", year: 1970, income_tier: "Middle", percent_population: 0.502 },
            { race: "Black", year: 1970, income_tier: "High", percent_population: 0.247 },
            { race: "Black", year: 2020, income_tier: "Low", percent_population: 0.237 },
            { race: "Black", year: 2020, income_tier: "Middle", percent_population: 0.426 },
            { race: "Black", year: 2020, income_tier: "High", percent_population: 0.337 },
            { race: "Hispanic", year: 1970, income_tier: "Low", percent_population: 0.456 },
            { race: "Hispanic", year: 1970, income_tier: "Middle", percent_population: 0.478 },
            { race: "Hispanic", year: 1970, income_tier: "High", percent_population: 0.066 },
            { race: "Hispanic", year: 2020, income_tier: "Low", percent_population: 0.389 },
            { race: "Hispanic", year: 2020, income_tier: "Middle", percent_population: 0.445 },
            { race: "Hispanic", year: 2020, income_tier: "High", percent_population: 0.166 },
            { race: "Asian", year: 1970, income_tier: "Low", percent_population: 0.234 },
            { race: "Asian", year: 1970, income_tier: "Middle", percent_population: 0.567 },
            { race: "Asian", year: 1970, income_tier: "High", percent_population: 0.199 },
            { race: "Asian", year: 2020, income_tier: "Low", percent_population: 0.189 },
            { race: "Asian", year: 2020, income_tier: "Middle", percent_population: 0.523 },
            { race: "Asian", year: 2020, income_tier: "High", percent_population: 0.288 }
        ];
        
        // Sample cost vs wages data
        costWagesData = [
            { year: 1970, cost_index: 103.7, median_income: 20171.4 },
            { year: 1980, cost_index: 117.6, median_income: 23280.2 },
            { year: 1990, cost_index: 151.7, median_income: 26237.0 },
            { year: 2000, cost_index: 171.6, median_income: 32611.7 },
            { year: 2010, cost_index: 195.8, median_income: 35690.8 },
            { year: 2020, cost_index: 222.6, median_income: 39814.3 }
        ];
        
        // Sample state data
        stateData = [
            { state: "CA", income_tier: "Low", percent_population: 0.31 },
            { state: "CA", income_tier: "Middle", percent_population: 0.462 },
            { state: "CA", income_tier: "High", percent_population: 0.228 },
            { state: "TX", income_tier: "Low", percent_population: 0.362 },
            { state: "TX", income_tier: "Middle", percent_population: 0.546 },
            { state: "TX", income_tier: "High", percent_population: 0.092 },
            { state: "NY", income_tier: "Low", percent_population: 0.305 },
            { state: "NY", income_tier: "Middle", percent_population: 0.577 },
            { state: "NY", income_tier: "High", percent_population: 0.117 },
            { state: "FL", income_tier: "Low", percent_population: 0.468 },
            { state: "FL", income_tier: "Middle", percent_population: 0.424 },
            { state: "FL", income_tier: "High", percent_population: 0.108 }
        ];
        
        console.log("Sample data created:", {
            income: incomeData.length,
            race: raceData.length,
            costWages: costWagesData.length,
            state: stateData.length
        });
    }

    
    
    // Helper function for trend analysis
    function showTrendAnalysis(tier) {
        const trendData = incomeData.filter(d => d.income_tier === tier)
            .map(d => ({ year: d.year, percent: d.percent_population * 100 }))
            .sort((a, b) => a.year - b.year);
            
        const startPercent = trendData[0].percent;
        const endPercent = trendData[trendData.length - 1].percent;
        const change = endPercent - startPercent;
        const direction = change > 0 ? "increased" : "decreased";
        
        alert(`${tier} Tier Trend Analysis:\n\n` +
              `1970: ${startPercent.toFixed(1)}%\n` +
              `2020: ${endPercent.toFixed(1)}%\n` +
              `Change: ${Math.abs(change).toFixed(1)}% ${direction}\n\n` +
              `This represents a ${Math.abs(change/startPercent*100).toFixed(1)}% relative change over 50 years.`);
    }
    
    // Helper function for detailed analysis
    function showDetailedAnalysis(tier) {
        const trendData = incomeData.filter(d => d.income_tier === tier)
            .map(d => ({ year: d.year, percent: d.percent_population * 100 }))
            .sort((a, b) => a.year - b.year);
            
        const startPercent = trendData[0].percent;
        const endPercent = trendData[trendData.length - 1].percent;
        const change = endPercent - startPercent;
        const direction = change > 0 ? "increased" : "decreased";
        
        // Find key turning points
        const maxPercent = Math.max(...trendData.map(d => d.percent));
        const minPercent = Math.min(...trendData.map(d => d.percent));
        const maxYear = trendData.find(d => d.percent === maxPercent).year;
        const minYear = trendData.find(d => d.percent === minPercent).year;
        
        alert(`${tier} Tier Detailed Analysis:\n\n` +
              `1970: ${startPercent.toFixed(1)}%\n` +
              `2020: ${endPercent.toFixed(1)}%\n` +
              `Peak: ${maxPercent.toFixed(1)}% in ${maxYear}\n` +
              `Lowest: ${minPercent.toFixed(1)}% in ${minYear}\n` +
              `Net Change: ${Math.abs(change).toFixed(1)}% ${direction}\n\n` +
              `This represents a ${Math.abs(change/startPercent*100).toFixed(1)}% relative change over 50 years.`);
    }

    function clearChart(title = '') {
        chartGroup.selectAll("*").remove();
        svg.select(".chart-title").remove();
        if(title) {
            svg.append("text")
               .attr("class", "chart-title")
               .attr("x", (width + margin.left + margin.right) / 2)
               .attr("y", margin.top / 2)
               .attr("text-anchor", "middle")
               .style("font-size", "1.2rem")
               .style("font-weight", "bold")
               .style("fill", "#333")
               .text(title);
        }
    }
    
    // SCENE 1: Stacked area chart showing middle class shrinkage over time
    function drawScene1() {
        clearChart("Middle Class Shrinkage Over Time");
        
        console.log("Drawing Scene 1");
        
        // Use all years of data to show the full transformation
        const years = [...new Set(incomeData.map(d => d.year))].sort(d3.ascending);
        const tiers = ["Low", "Middle", "High"];
        
        const dataForStack = years.map(year => {
            const yearData = incomeData.filter(d => d.year === year);
            const obj = { year: year };
            tiers.forEach(tier => {
                const tierData = yearData.find(d => d.income_tier === tier);
                obj[tier] = tierData ? tierData.percent_population * 100 : 0;
            });
            return obj;
        });

        console.log("Data for stack:", dataForStack);

        // Map our data to match the reference format
        const timeData = dataForStack.map(d => ({
            year: d.year,
            "Lower Class": d.Low,
            "Middle Class": d.Middle,
            "Upper Class": d.High
        }));

        const tiersFormatted = ["Lower Class", "Middle Class", "Upper Class"];
        
        const stack = d3.stack()
            .keys(tiersFormatted)
            .value((d, key) => d[key]);
        
        const stackedData = stack(timeData);

        // Use linear scale for smooth area chart
        const x = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([0, width]);
            
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
            
        const color = d3.scaleOrdinal()
            .domain(tiersFormatted)
            .range(["#e74c3c", "#3498db", "#2ecc71"]);

        // Add axes with proper formatting and labels
        chartGroup.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        chartGroup.append("g")
            .call(d3.axisLeft(y).tickFormat(d => d + "%"));
            
        // Add y-axis label
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text("Percentage of Population");
            
        // Add x-axis label
        chartGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text("Year");

        // Create area generator
        const area = d3.area()
            .x(d => x(d.data.year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveMonotoneX);

        // Create stacked areas
        chartGroup.selectAll(".area")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("d", area)
            .attr("fill", (d, i) => color(tiersFormatted[i]))
            .attr("opacity", 0.8);
            
        // Add a vertical guide line (initially hidden)
        const guideLine = chartGroup.append("line")
            .attr("class", "guide-line")
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0)
            .attr("y1", 0)
            .attr("y2", height);

        // Add a transparent overlay for tooltip interactivity
        const overlay = chartGroup.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all");

        overlay.on("mouseover", (event) => {
            tooltip.style("opacity", 1);
            guideLine.attr("opacity", 0.5);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
            guideLine.attr("opacity", 0);
        })
        .on("mousemove", (event) => {
            const [mx, my] = d3.pointer(event);
            const date = x.invert(mx);

            // Find the closest year
            const bisect = d3.bisector(d => d.year).right;
            const i = bisect(timeData, date, 1);
            const d0 = timeData[i - 1];
            const d1 = timeData[i];
            const d = d1 && (date - d0.year) > (d1.year - date) ? d1 : d0;

            if (d) {
                // Update the position of the guide line
                const yearX = x(d.year);
                guideLine.attr("x1", yearX).attr("x2", yearX);

                // Build tooltip content
                let tooltipContent = `<strong>Year: ${d.year}</strong><br/><br/>`;
                tiersFormatted.forEach(tier => {
                    const value = d[tier];
                    tooltipContent += `<span style="color: ${color(tier)};">●</span> ${tier}: ${value.toFixed(1)}%<br/>`;
                });

                // Update tooltip position and content
                tooltip.html(tooltipContent)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            }
        });

        // Add legend with semi-transparent background
        const legend = chartGroup.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 30}, 20)`);
            
        // Add background rectangle for legend
        legend.append("rect")
            .attr("width", 130)
            .attr("height", 82)
            .attr("fill", "rgba(255, 255, 255, 0.9)")
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .attr("rx", 5);
            
        // Add legend title
        legend.append("text")
            .attr("x", 65)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text("Income Tiers");
            
        tiersFormatted.forEach((tier, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(10, ${i * 18 + 25})`);
                
            legendRow.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", color(tier));
                
            legendRow.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .style("font-size", "11px")
                .style("fill", "#333")
                .text(tier);
        });

    }
    

    
    function drawScene3() {
        const selectedRace = d3.select("#race-selector").property("value");
        drawRacialComparison(selectedRace);
    }
    
    function drawRacialComparison(selectedRace) {
        // Clear the chart and set the title based on the selected race
        const title = selectedRace === "All" ? "Income Distribution by Race: 1970 vs 2020" : `Income Distribution for ${selectedRace} Population: 1970-2020`;
        clearChart(title);
        
        console.log("Drawing Racial Comparison for:", selectedRace);
        
        const tiers = ["Low", "Middle", "High"];
        const tiersFormatted = ["Lower Class", "Middle Class", "Upper Class"];
        const color = d3.scaleOrdinal()
            .domain(tiersFormatted)
            .range(["#d62728", "#ff7f0e", "#2ca02c"]);
        
        // --- Code for "All" races (Stacked Bar Chart) ---
        if (selectedRace === "All") {
            const races = ["White", "Black", "Hispanic", "Asian"];
            const years = [1970, 2020];
            
            // Prepare data for stacked bars
            const chartData = [];
            races.forEach(race => {
                years.forEach(year => {
                    const yearData = raceData.filter(d => d.race === race && d.year === year);
                    const obj = { race: race, year: year };
                    tiersFormatted.forEach((tier, i) => {
                        const tierData = yearData.find(d => d.income_tier === tiers[i]);
                        obj[tier] = tierData ? tierData.percent_population * 100 : 0;
                    });
                    chartData.push(obj);
                });
            });
            
            console.log("Chart data:", chartData);
            
            // Create scales for stacked bars
            const x0 = d3.scaleBand().domain(races).range([0, width]).padding(0.1);
            const x1 = d3.scaleBand().domain(years).range([0, x0.bandwidth()]).padding(0.05);
            const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
            
            // Create stack generator
            const stack = d3.stack().keys(tiersFormatted).value((d, key) => d[key]);
            const stackedBars = stack(chartData);
            console.log("Stacked bars:", stackedBars);
            
            // Add axes
            chartGroup.append("g")
                .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Percentage of Population");
                
            chartGroup.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x0))
                .selectAll("text")
                .style("text-anchor", "middle")
                .style("font-size", "12px");
                
            chartGroup.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Race");
            
            // Create stacked bars
            chartGroup.selectAll(".layer")
                .data(stackedBars)
                .join("g")
                .attr("class", "layer")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x0(d.data.race) + x1(d.data.year))
                .attr("y", d => y(d[1]))
                .attr("width", x1.bandwidth())
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("opacity", 0.8)
                .on("mouseover", function(event, d) {
                    const percentage = (d[1] - d[0]).toFixed(1);
                    tooltip.style("opacity", 1)
                           .html(`<strong>${d.data.race}</strong><br>${d.data.year}: ${percentage}%`);
                    d3.select(this).attr("opacity", 1).attr("stroke", "black").attr("stroke-width", 2);
                })
                .on("mousemove", (event) => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                    d3.select(this).attr("opacity", 0.8).attr("stroke", null);
                });
            
            // Add legend
            const legend = chartGroup.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width + 30}, 20)`);
                
            tiersFormatted.forEach((tier, i) => {
                const legendRow = legend.append("g")
                    .attr("transform", `translate(0, ${i * 20})`);
                    
                legendRow.append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", color(tier));
                    
                legendRow.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .style("font-size", "12px")
                    .text(tier);
            });
            
        } 
        
        // --- Code for individual races (Stacked Area Chart) ---
        else {
            console.log("Selected race:", selectedRace);
            console.log("Available race data:", raceData.map(d => d.race));
            const filteredRaceData = raceData.filter(d => d.race === selectedRace);
            console.log("Filtered race data:", filteredRaceData);
            const years = [...new Set(filteredRaceData.map(d => d.year))].sort(d3.ascending);
            console.log("Available years:", years);

            const dataForStack = years.map(year => {
                const yearData = filteredRaceData.filter(d => d.year === year);
                const obj = { year: year };
                tiersFormatted.forEach((tier, i) => {
                    const tierData = yearData.find(d => d.income_tier === tiers[i]);
                    obj[tier] = tierData ? tierData.percent_population * 100 : 0;
                });
                return obj;
            });

            const stack = d3.stack().keys(tiersFormatted).value((d, key) => d[key]);
            const stackedData = stack(dataForStack);

            const x = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);
            const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

            // Add axes
            chartGroup.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

            chartGroup.append("g")
                .call(d3.axisLeft(y).tickFormat(d => d + "%"));
                
            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 15)
                .attr("x", -height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Percentage of Population");
                
            chartGroup.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#666")
                .text("Year");

            const area = d3.area()
                .x(d => x(d.data.year))
                .y0(d => y(d[0]))
                .y1(d => y(d[1]))
                .curve(d3.curveMonotoneX);
                
            chartGroup.selectAll(".layer")
                .data(stackedData)
                .join("path")
                .attr("class", "layer")
                .attr("d", area)
                .attr("fill", d => color(d.key))
                .attr("opacity", 0.8);

            // Add a vertical guide line (initially hidden)
            const guideLine = chartGroup.append("line")
                .attr("class", "guide-line")
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "3,3")
                .attr("opacity", 0)
                .attr("y1", 0)
                .attr("y2", height);
            
            // Add a transparent overlay for tooltip interactivity
            const overlay = chartGroup.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("pointer-events", "all");

            overlay.on("mouseover", () => {
                tooltip.style("opacity", 1);
                guideLine.attr("opacity", 0.5);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
                guideLine.attr("opacity", 0);
            })
            .on("mousemove", (event) => {
                const [mx, my] = d3.pointer(event);
                const date = x.invert(mx);

                // Find the closest yeaar
                const bisect = d3.bisector(d => d.year).right;
                const i = bisect(dataForStack, date, 1);
                const d0 = dataForStack[i - 1];
                const d1 = dataForStack[i];
                const d = d1 && (date - d0.year) > (d1.year - date) ? d1 : d0;
                
                if (d) {
                    // Update the position of the guide line
                    const yearX = x(d.year);
                    guideLine.attr("x1", yearX).attr("x2", yearX);

                    // Build tooltip content
                    let tooltipContent = `<strong>Year: ${d.year}</strong><br/><br/>`;
                    tiersFormatted.forEach(tier => {
                        const value = d[tier];
                        tooltipContent += `<span style="color: ${color(tier)};">●</span> ${tier}: ${value.toFixed(1)}%<br/>`;
                    });

                    // Update tooltip position and content
                    tooltip.html(tooltipContent)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                }
            });

            // Add legend
            const legend = chartGroup.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width + 30}, 20)`);
                
            legend.append("rect")
                .attr("width", 130)
                .attr("height", 82)
                .attr("fill", "rgba(255, 255, 255, 0.9)")
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("rx", 5);
                
            legend.append("text")
                .attr("x", 65)
                .attr("y", 15)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("fill", "#333")
                .text("Income Tiers");
                
            tiersFormatted.forEach((tier, i) => {
                const legendRow = legend.append("g")
                    .attr("transform", `translate(10, ${i * 18 + 25})`);
                    
                legendRow.append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", color(tier));
                    
                legendRow.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .style("font-size", "11px")
                    .style("fill", "#333")
                    .text(tier);
            });
        }
    }




    // SCENE 4: Enhanced line chart with economic crisis annotations
    function drawScene4() {
        clearChart("The Great Divergence: Income vs. Cost of Living (1970-2020)");
        
        // Move the entire chart to the right by 20 pixels
        chartGroup.attr("transform", `translate(${margin.left + 20},${margin.top})`);
        
        console.log("Drawing Scene 4");
        console.log("Cost wages data:", costWagesData);
        
        const data = costWagesData.sort((a, b) => a.year - b.year);
        
        // Change to d3.scaleLinear to support all years between the min and max
        const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([0, width]);
        const yIncome = d3.scaleLinear().domain([0, d3.max(data, d => d.median_income)]).nice().range([height, 0]);
        const yCost = d3.scaleLinear().domain([0, d3.max(data, d => d.cost_index)]).nice().range([height, 0]);

        // Add axes with proper labels
        chartGroup.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "10px");
            
        // Add x-axis label
        chartGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#666")
            .text("Year");
        
        const yAxisIncome = chartGroup.append("g").call(d3.axisLeft(yIncome).tickFormat(d3.format("$.0f")));
        yAxisIncome.selectAll(".domain, .tick line").style("stroke", "#1f77b4");
        yAxisIncome.selectAll("text").style("fill", "#1f77b4");
        yAxisIncome.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("fill", "#1f77b4")
            .style("font-size", "12px")
            .text("Median Income ($)");

        const yAxisCost = chartGroup.append("g").attr("transform", `translate(${width}, 0)`).call(d3.axisRight(yCost));
        yAxisCost.selectAll(".domain, .tick line").style("stroke", "#d62728");
        yAxisCost.selectAll("text").style("fill", "#d62728");
        yAxisCost.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.right)
            .attr("x", -height / 2)
            .attr("fill", "#d62728")
            .style("font-size", "12px")
            .text("Cost of Living Index");
            
        const lineIncome = d3.line().x(d => x(d.year)).y(d => yIncome(d.median_income));
        const lineCost = d3.line().x(d => x(d.year)).y(d => yCost(d.cost_index));
        
        // Draw income line with enhanced styling
        chartGroup.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#1f77b4")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "0")
            .attr("d", d => d3.line().x(d => x(d.year)).y(height)(d))
            .transition().duration(1500)
            .attr("d", lineIncome);
        
        // Draw cost line with enhanced styling
        chartGroup.append("path")
            .datum(data)
                .attr("fill", "none")
            .attr("stroke", "#d62728")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5")
            .attr("d", d => d3.line().x(d => x(d.year)).y(height)(d))
            .transition().duration(1500)
            .attr("d", lineCost);
            
        // Add data points for interaction
        chartGroup.selectAll(".income-point")
            .data(data)
            .join("circle")
            .attr("class", "income-point")
            .attr("cx", d => x(d.year))
            .attr("cy", d => yIncome(d.median_income))
            .attr("r", 4)
            .attr("fill", "#1f77b4")
            .attr("opacity", 0)
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.year}</strong><br>Income: $${d.median_income.toLocaleString()}<br>Cost Index: ${d.cost_index}`);
                d3.select(this).attr("r", 6).attr("opacity", 1);
            })
            .on("mousemove", (event) => tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
                d3.select(this).attr("r", 4).attr("opacity", 0);
            })
            .transition().duration(1500).delay((d, i) => i * 30)
            .attr("opacity", 0.7);
            
        // Add economic crisis annotations
        const crises = [
            { year: 1973, name: "Oil Crisis", y: height * 0.2 },
            { year: 1980, name: "Early 80s Recession", y: height * 0.3 },
            { year: 2008, name: "Great Recession", y: height * 0.4 }
        ];
        
        crises.forEach(crisis => {
            const xPosition = x(crisis.year);
            // The check for xPosition is now redundant, but harmless, as scaleLinear
            // will always return a value within the domain.
            if (xPosition) {
                chartGroup.append("line")
                    .attr("x1", xPosition)
                    .attr("x2", xPosition)
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("stroke", "#666")
                    .attr("stroke-width", 1)
                    .attr("stroke-dasharray", "3,3")
                    .attr("opacity", 0.5);
                    
                chartGroup.append("text")
                    .attr("x", xPosition)
                    .attr("y", crisis.y)
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90, " + xPosition + ", " + crisis.y + ")")
                    .style("font-size", "10px")
                    .style("fill", "#666")
                    .text(crisis.name);
            }
        });
        
        // Add legend
        const legend = chartGroup.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(300, 20)`);
            
        const legendItems = [
            { color: "#1f77b4", text: "Median Income", dash: "0" },
            { color: "#d62728", text: "Cost of Living", dash: "5,5" }
        ];
        
        legendItems.forEach((item, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);
                
            legendRow.append("line")
                .attr("x1", 0)
                .attr("x2", 20)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", item.color)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", item.dash);
                
            legendRow.append("text")
                .attr("x", 25)
                .attr("y", 5)
                .style("font-size", "12px")
                .text(item.text);
        });
    }







    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    function showTooltip(event, content) {
        const tooltip = d3.select("#tooltip");
        tooltip.style("opacity", 1)
            .html(content)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }

    function hideTooltip() {
        d3.select("#tooltip").style("opacity", 0);
    }

    // Initialize the application
    init();
});