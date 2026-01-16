// debug-dashboard.js
// Run with: node debug-dashboard.js

const BASE_URL = "http://localhost:3000/api";

// Replace with your credentials
const EMAIL = "samueledohoeket257@gmail.com";
const PASSWORD = "password123";

async function debugDashboard() {
  try {
    console.log("🔐 Logging in...");
    
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      console.error("❌ Login failed:", loginData.error);
      return;
    }
    
    const token = loginData.data.session.access_token;
    console.log("✅ Login successful!\n");
    
    // Get all income
    console.log("💰 Fetching all income...");
    const incomeRes = await fetch(`${BASE_URL}/income`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const incomeData = await incomeRes.json();
    
    console.log(`Found ${incomeData.data.length} income entries:`);
    let totalIncome = 0;
    const sourceTotals = {};
    
    incomeData.data.forEach((income, i) => {
      console.log(`  ${i + 1}. $${income.amount} from ${income.source} on ${income.date}`);
      totalIncome += Number(income.amount);
      sourceTotals[income.source] = (sourceTotals[income.source] || 0) + Number(income.amount);
    });
    
    console.log(`\nCalculated Total Income: $${totalIncome}`);
    console.log("Source Totals:", sourceTotals);
    
    const topSource = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1])[0];
    console.log(`Top Source: ${topSource ? topSource[0] : 'none'} ($${topSource ? topSource[1] : 0})\n`);
    
    // Get all goals
    console.log("🎯 Fetching all goals...");
    const goalsRes = await fetch(`${BASE_URL}/goals`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const goalsData = await goalsRes.json();
    
    console.log(`Found ${goalsData.data.length} goals:`);
    let totalSaved = 0;
    let activeCount = 0;
    let completedCount = 0;
    
    goalsData.data.forEach((goal, i) => {
      console.log(`  ${i + 1}. "${goal.name}": $${goal.current_amount}/$${goal.target_amount} (${goal.status})`);
      totalSaved += Number(goal.current_amount);
      if (goal.status === 'active') activeCount++;
      if (goal.status === 'completed') completedCount++;
    });
    
    console.log(`\nCalculated Total Saved: $${totalSaved}`);
    console.log(`Active Goals: ${activeCount}`);
    console.log(`Completed Goals: ${completedCount}`);
    
    const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;
    console.log(`Calculated Savings Rate: ${savingsRate}%\n`);
    
    // Get dashboard
    console.log("📊 Fetching dashboard...");
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    
    console.log("\n=== DASHBOARD RESPONSE ===");
    console.log(JSON.stringify(dashData.data, null, 2));
    
    console.log("\n=== COMPARISON ===");
    console.log("Field                  | Expected      | Actual        | Match?");
    console.log("----------------------|---------------|---------------|-------");
    console.log(`totalIncome           | $${totalIncome.toString().padEnd(12)} | $${dashData.data.totalIncome.toString().padEnd(12)} | ${totalIncome === dashData.data.totalIncome ? '✅' : '❌'}`);
    console.log(`incomeCount           | ${incomeData.data.length.toString().padEnd(13)} | ${dashData.data.incomeCount.toString().padEnd(13)} | ${incomeData.data.length === dashData.data.incomeCount ? '✅' : '❌'}`);
    console.log(`totalSaved            | $${totalSaved.toString().padEnd(12)} | $${dashData.data.totalSaved.toString().padEnd(12)} | ${totalSaved === dashData.data.totalSaved ? '✅' : '❌'}`);
    console.log(`activeGoalsCount      | ${activeCount.toString().padEnd(13)} | ${dashData.data.activeGoalsCount.toString().padEnd(13)} | ${activeCount === dashData.data.activeGoalsCount ? '✅' : '❌'}`);
    console.log(`completedGoalsCount   | ${completedCount.toString().padEnd(13)} | ${dashData.data.completedGoalsCount.toString().padEnd(13)} | ${completedCount === dashData.data.completedGoalsCount ? '✅' : '❌'}`);
    console.log(`savingsRate           | ${savingsRate}%${' '.repeat(12 - savingsRate.toString().length)} | ${dashData.data.savingsRate}%${' '.repeat(12 - dashData.data.savingsRate.toString().length)} | ${savingsRate === dashData.data.savingsRate ? '✅' : '❌'}`);
    console.log(`topSource             | ${(topSource?.[0] || 'null').padEnd(13)} | ${(dashData.data.topSource || 'null').padEnd(13)} | ${(topSource?.[0] || null) === dashData.data.topSource ? '✅' : '❌'}`);
    
    console.log("\n🔍 DIAGNOSIS:");
    
    // Check for issues
    if (totalIncome !== dashData.data.totalIncome) {
      console.log("❌ INCOME MISMATCH:");
      console.log("   - Dashboard might be filtering by date (last 30 days only)");
      console.log("   - Check if some income is older than 30 days");
      console.log("   - Dashboard uses: gte('date', thirtyDaysAgo)");
    }
    
    if (totalSaved !== dashData.data.totalSaved) {
      console.log("❌ SAVED AMOUNT MISMATCH:");
      console.log("   - Check if goals query has different filters");
      console.log("   - Dashboard might only count active goals");
    }
    
    if (activeCount !== dashData.data.activeGoalsCount) {
      console.log("❌ ACTIVE GOALS MISMATCH:");
      console.log("   - Some goals might have auto-completed");
      console.log("   - Check goal status in database");
    }
    
    if ((topSource?.[0] || null) !== dashData.data.topSource) {
      console.log("❌ TOP SOURCE MISMATCH:");
      console.log("   - Dashboard might be filtering by date");
      console.log("   - Only counts income from last 30 days");
    }
    
    console.log("\n✅ Debug complete!");
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    console.error(error.stack);
  }
}

debugDashboard();