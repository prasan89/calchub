export interface CalcSEO {
  title: string;
  metaDesc: string;
  h1Override?: string;
  aboutText: string;
  howToUse: string[];
  formula?: string;
  example?: string;
  faqs: Array<{ q: string; a: string }>;
}

export const calcSEO: Record<string, CalcSEO> = {
  "mortgage-calculator": {
    title: "Mortgage Calculator – Monthly Payment & Interest",
    metaDesc:
      "Calculate your monthly mortgage payment, total interest paid, and full amortization schedule. Free mortgage calculator for home buyers in the US and India.",
    h1Override: "Mortgage Calculator",
    aboutText:
      "A mortgage calculator helps you estimate your monthly home loan payment based on the loan amount, interest rate, and loan term. The standard formula is M = P[r(1+r)^n]/[(1+r)^n-1], where P is principal, r is monthly rate, and n is number of payments. Use it to compare loan offers, plan your budget, and understand how much interest you will pay over the life of the loan.",
    howToUse: [
      "Enter the home price and your down payment amount to get the loan principal.",
      "Input the annual interest rate quoted by your lender (e.g., 7%).",
      "Select the loan term — typically 15 or 30 years.",
      "Click Calculate to see your monthly payment and the full interest cost.",
    ],
    formula: "M = P × [r(1+r)^n] / [(1+r)^n − 1]",
    example:
      "For a $300,000 mortgage at 7% for 30 years: monthly payment = $1,996. Total interest paid = $418,527.",
    faqs: [
      {
        q: "What is the monthly payment on a $300,000 mortgage at 7%?",
        a: "For a 30-year fixed mortgage of $300,000 at 7% annual interest, the monthly payment is approximately $1,996. Over 30 years you will pay about $418,527 in interest.",
      },
      {
        q: "Does the mortgage calculator include property taxes and insurance?",
        a: "Our basic calculator covers principal and interest (P&I). Property taxes, homeowner's insurance, and PMI vary by location; add them to get your total monthly housing cost (PITI).",
      },
      {
        q: "How does a larger down payment affect my mortgage?",
        a: "A larger down payment reduces your loan principal, which lowers both the monthly payment and total interest paid. Putting 20% down also lets you avoid private mortgage insurance (PMI).",
      },
      {
        q: "What is the difference between a 15-year and 30-year mortgage?",
        a: "A 15-year mortgage has higher monthly payments but far less total interest. For the same $300,000 at 7%, a 15-year loan costs about $2,696/month but saves over $200,000 in interest compared to the 30-year option.",
      },
    ],
  },

  "emi-calculator": {
    title: "EMI Calculator – Loan EMI with Amortization Table",
    metaDesc:
      "Calculate your Equated Monthly Instalment (EMI) for home, car, or personal loans. Get principal, interest, and full repayment schedule instantly.",
    h1Override: "EMI Calculator",
    aboutText:
      "An EMI (Equated Monthly Instalment) calculator computes the fixed monthly payment required to repay a loan in full over its tenure. The formula is EMI = P × r × (1+r)^n / [(1+r)^n − 1], where P is the principal, r is the monthly interest rate, and n is the number of months. It is widely used in India for home loans, car loans, and personal loans from banks like SBI, HDFC, and ICICI.",
    howToUse: [
      "Enter the loan amount (principal) in rupees or dollars.",
      "Input the annual interest rate offered by your bank.",
      "Set the loan tenure in months or years.",
      "Hit Calculate to view the monthly EMI, total interest, and a month-by-month amortization schedule.",
    ],
    formula: "EMI = P × r × (1+r)^n / [(1+r)^n − 1]",
    example:
      "For a ₹10,00,000 home loan at 8.5% for 20 years: EMI = ₹8,678. Total interest = ₹1,08,272 over 240 months.",
    faqs: [
      {
        q: "What is EMI and how is it calculated?",
        a: "EMI stands for Equated Monthly Instalment. It is the fixed amount you pay every month to repay a loan. It is calculated using the formula: EMI = P × r × (1+r)^n / [(1+r)^n − 1].",
      },
      {
        q: "Does prepayment reduce EMI or tenure?",
        a: "Most banks offer you the choice. Reducing tenure saves more interest; reducing EMI frees up monthly cash flow. Check your loan agreement for prepayment charges.",
      },
      {
        q: "What is the EMI for a ₹5 lakh personal loan at 12% for 3 years?",
        a: "The EMI would be approximately ₹16,607 per month. Total interest paid over 36 months is about ₹97,852.",
      },
      {
        q: "Is EMI the same as a monthly mortgage payment?",
        a: "Yes, in concept. EMI is the Indian term for what Western countries call a monthly mortgage or loan installment — a fixed payment covering both principal and interest.",
      },
    ],
  },

  "loan-calculator": {
    title: "Loan Calculator – Monthly Payment, Interest & Payoff",
    metaDesc:
      "Free loan calculator for any loan type. Compute monthly payment, total interest, and payoff timeline for personal, home, car, or business loans.",
    h1Override: "Loan Calculator",
    aboutText:
      "A loan calculator determines your monthly repayment based on the borrowed amount, annual interest rate, and repayment period using standard amortization math. The formula is Payment = Principal × [rate(1+rate)^months] / [(1+rate)^months − 1]. It applies to personal loans, home loans, auto loans, and business financing, helping borrowers compare lenders and choose a term that fits their budget.",
    howToUse: [
      "Enter the total loan amount you need to borrow.",
      "Input the annual interest rate from your lender's offer.",
      "Choose the repayment term in months or years.",
      "Review the monthly payment, total interest, and cumulative repayment chart.",
    ],
    formula: "Monthly Payment = P × [r(1+r)^n] / [(1+r)^n − 1]",
    example:
      "A $20,000 personal loan at 10% APR for 5 years: monthly payment = $424.94. Total interest = $5,496.",
    faqs: [
      {
        q: "How do I calculate my monthly loan payment?",
        a: "Use the amortization formula: Payment = P × [r(1+r)^n] / [(1+r)^n − 1], where r is the monthly interest rate and n is the total number of months. Our calculator does this instantly.",
      },
      {
        q: "What is APR vs interest rate on a loan?",
        a: "The interest rate is the cost of borrowing the principal. APR (Annual Percentage Rate) includes the interest rate plus fees, making it a more complete measure of total loan cost.",
      },
      {
        q: "Should I choose a shorter or longer loan term?",
        a: "A shorter term means higher monthly payments but significantly less total interest. A longer term lowers your monthly payment but costs more overall. Run both scenarios in the calculator to decide.",
      },
      {
        q: "Can I pay off a loan early without penalty?",
        a: "Many personal loans allow prepayment without penalty, but some charge a fee. Check your loan agreement. Our calculator can show how extra monthly payments reduce your payoff date and total interest.",
      },
    ],
  },

  "auto-loan-calculator": {
    title: "Auto Loan Calculator – Car Payment & Total Cost",
    metaDesc:
      "Calculate your monthly car loan payment, total interest, and true cost of ownership. Compare new and used auto loan scenarios with our free calculator.",
    h1Override: "Auto Loan Calculator",
    aboutText:
      "An auto loan calculator helps you determine the monthly payment for financing a vehicle purchase. It uses the standard amortization formula with the car price minus down payment as the principal, the dealer or bank interest rate, and the loan term (typically 24–84 months). Understanding your total cost — including interest — prevents overpaying at the dealership and helps you shop smarter.",
    howToUse: [
      "Enter the vehicle price and your down payment or trade-in value.",
      "Input the annual interest rate (APR) from your lender or dealer.",
      "Select the loan term — common options are 36, 48, 60, or 72 months.",
      "View the monthly payment, total interest paid, and loan payoff schedule.",
    ],
    formula: "Monthly Payment = (Car Price − Down Payment) × [r(1+r)^n] / [(1+r)^n − 1]",
    example:
      "A $35,000 car with a $5,000 down payment at 6% APR for 60 months: monthly payment = $579.98. Total interest = $4,799.",
    faqs: [
      {
        q: "What is a good interest rate for a car loan in 2026?",
        a: "Average auto loan rates in 2026 range from 5%–8% for borrowers with good credit (680+). Rates above 10% suggest room to shop around or improve your credit score first.",
      },
      {
        q: "Is a 72-month car loan a bad idea?",
        a: "Longer terms lower your monthly payment but increase total interest and raise the risk of being 'underwater' (owing more than the car is worth). Most financial advisors recommend keeping auto loans to 60 months or less.",
      },
      {
        q: "How much should I put down on a car?",
        a: "A 20% down payment on a new car and 10% on a used car is generally recommended. This reduces your loan amount, lowers monthly payments, and prevents negative equity early in the loan.",
      },
      {
        q: "Does the auto loan calculator include sales tax and fees?",
        a: "Our calculator focuses on the financed amount. Add sales tax, dealer fees, and registration costs to the vehicle price to get the true amount you may need to finance.",
      },
    ],
  },

  "compound-interest-calculator": {
    title: "Compound Interest Calculator – Growth with Compounding",
    metaDesc:
      "Calculate compound interest on savings or investments. See how compounding frequency (daily, monthly, yearly) accelerates your money's growth over time.",
    h1Override: "Compound Interest Calculator",
    aboutText:
      "Compound interest is the process of earning interest on both the initial principal and the accumulated interest from previous periods — often called 'interest on interest.' The formula is A = P(1 + r/n)^(nt), where P is principal, r is annual rate, n is compounding periods per year, and t is time in years. It is the foundation of long-term wealth building through savings accounts, fixed deposits, and investment portfolios.",
    howToUse: [
      "Enter your starting principal (initial investment or deposit).",
      "Input the annual interest rate as a percentage (e.g., 8).",
      "Choose how often interest compounds: daily, monthly, quarterly, or annually.",
      "Set the investment duration and click Calculate to see the final amount and total interest earned.",
    ],
    formula: "A = P × (1 + r/n)^(n × t)",
    example:
      "₹1,00,000 invested at 8% compounded annually for 10 years grows to ₹2,15,892. Total interest earned = ₹1,15,892.",
    faqs: [
      {
        q: "What is the difference between simple and compound interest?",
        a: "Simple interest is calculated only on the original principal. Compound interest is calculated on the principal plus all accumulated interest, so your earnings grow exponentially over time.",
      },
      {
        q: "How often should interest compound to maximize returns?",
        a: "The more frequently interest compounds, the more you earn. Daily compounding yields slightly more than monthly, which yields more than annual. For most savings accounts, monthly or daily compounding is standard.",
      },
      {
        q: "What is the Rule of 72?",
        a: "The Rule of 72 is a quick mental shortcut: divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 8%, money doubles in roughly 9 years.",
      },
      {
        q: "Can compound interest work against me?",
        a: "Yes. On credit cards and loans, unpaid interest compounds against you. This is why carrying a high-interest balance can make debt grow rapidly — the same math that builds wealth can drain it.",
      },
    ],
  },

  "sip-calculator": {
    title: "SIP Calculator – Monthly SIP Returns & Future Value",
    metaDesc:
      "Calculate the future value of your SIP mutual fund investments. Find out how much your monthly SIP will grow in 5, 10, or 20 years with expected returns.",
    h1Override: "SIP Calculator",
    aboutText:
      "A SIP (Systematic Investment Plan) calculator estimates the future value of regular monthly investments in a mutual fund. It uses the compound interest formula for recurring investments: FV = P × [(1 + r)^n − 1] / r × (1 + r), where P is monthly investment, r is monthly return rate, and n is total months. SIPs are one of the most popular long-term wealth-building tools in India, allowing investors to benefit from rupee cost averaging.",
    howToUse: [
      "Enter the monthly SIP amount you plan to invest (e.g., ₹5,000).",
      "Input the expected annual return rate of your mutual fund (e.g., 12%).",
      "Select the investment duration in years (e.g., 15 years).",
      "Click Calculate to see the total invested, estimated returns, and future corpus.",
    ],
    formula: "FV = P × [(1 + r)^n − 1] / r × (1 + r)",
    example:
      "A monthly SIP of ₹5,000 at 12% annual return for 15 years: total invested = ₹9,00,000; estimated corpus = ₹25,22,880.",
    faqs: [
      {
        q: "Is 12% a realistic return expectation for a SIP?",
        a: "Indian equity mutual funds have historically delivered 10%–14% CAGR over long periods (10+ years). 12% is a common benchmark estimate, but actual returns vary. Past performance does not guarantee future results.",
      },
      {
        q: "What is the minimum amount to start a SIP?",
        a: "Most mutual funds allow SIPs starting at ₹500 per month. Many popular large-cap and index funds set a minimum of ₹100–₹500.",
      },
      {
        q: "Can I stop a SIP midway?",
        a: "Yes, SIPs can be paused or stopped at any time without penalty in most funds. The already-invested units remain in your account and continue to grow.",
      },
      {
        q: "How is SIP different from a lump-sum investment?",
        a: "SIP spreads purchases over time, reducing the impact of market volatility through rupee cost averaging. Lump-sum investment is a single large purchase, which can yield better returns in a consistently rising market.",
      },
    ],
  },

  "retirement-calculator": {
    title: "Retirement Calculator – Savings Goal & Corpus Needed",
    metaDesc:
      "Find out how much you need to save for retirement. Calculate your retirement corpus, monthly savings required, and how long your savings will last.",
    h1Override: "Retirement Calculator",
    aboutText:
      "A retirement calculator helps you estimate the nest egg required to sustain your desired lifestyle after you stop working. It accounts for your current age, retirement age, expected expenses, inflation, and investment returns to project both the corpus needed and the monthly savings required to reach it. Planning early is critical — every decade of delay dramatically increases the savings rate required.",
    howToUse: [
      "Enter your current age and the age at which you plan to retire.",
      "Input your expected monthly expenses in retirement (in today's rupees/dollars).",
      "Set the assumed annual inflation rate and expected post-retirement investment return.",
      "Click Calculate to see your required retirement corpus and the monthly savings needed starting now.",
    ],
    formula: "Corpus = Monthly Expense × 12 × (1 − (1 + real rate)^−years) / real rate",
    example:
      "If you are 30, want to retire at 60 with ₹50,000/month in today's money, assuming 6% inflation and 8% returns: required corpus ≈ ₹5.2 crore.",
    faqs: [
      {
        q: "How much do I need to retire comfortably in India?",
        a: "A common rule of thumb is the 25× rule: save 25 times your annual expenses. For ₹6 lakh/year in expenses, you need ₹1.5 crore. With Indian inflation, most planners recommend a larger buffer of 30–35×.",
      },
      {
        q: "What is the 4% withdrawal rule?",
        a: "The 4% rule suggests you can withdraw 4% of your retirement portfolio annually without running out of money for 30 years. It originated from US research; for India, a 3%–3.5% rate is often recommended due to higher inflation.",
      },
      {
        q: "Should I include EPF/PPF in my retirement corpus estimate?",
        a: "Yes. Your EPF, PPF, NPS, and any pension income should be included as income sources during retirement. Subtract these from the total corpus needed to find how much you must save additionally.",
      },
      {
        q: "What happens if I start saving for retirement at 40 instead of 30?",
        a: "Starting at 40 instead of 30 roughly doubles the required monthly savings to reach the same corpus, because you lose a decade of compounding. The earlier you start, the less you need to save each month.",
      },
    ],
  },

  "investment-calculator": {
    title: "Investment Calculator – Returns on Stocks & Mutual Funds",
    metaDesc:
      "Calculate investment growth with one-time or recurring contributions. Project returns at different rates and time horizons to plan your financial future.",
    h1Override: "Investment Calculator",
    aboutText:
      "An investment calculator projects the future value of money invested today or contributed regularly at an assumed annual rate of return. It applies the compound growth formula A = P(1 + r)^t for lump sums or the future value of an annuity formula for periodic contributions. Use it to model stocks, mutual funds, ETFs, fixed deposits, or any return-generating asset across different time horizons.",
    howToUse: [
      "Enter the initial investment amount (lump sum) and any regular monthly additions.",
      "Input the expected annual rate of return based on your asset class (e.g., 10% for equities).",
      "Set the investment horizon in years.",
      "View the projected final value, total contributions, and total returns earned.",
    ],
    formula: "A = P(1 + r)^t + PMT × [(1 + r)^t − 1] / r",
    example:
      "$10,000 lump sum plus $200/month at 9% for 20 years: final value = $179,560. Total contributions = $58,000. Total returns = $121,560.",
    faqs: [
      {
        q: "What is a realistic expected return on investments?",
        a: "Historically, US large-cap stocks (S&P 500) have averaged about 10% annually before inflation. Indian equities (Nifty 50) have delivered around 12%–14%. Bonds and FDs return 5%–8%. Use conservative estimates for planning.",
      },
      {
        q: "What does 'rate of return' mean?",
        a: "Rate of return is the net gain or loss on an investment expressed as a percentage of the original cost. A 10% annual rate of return means your investment grew by 10% in one year.",
      },
      {
        q: "How does adding monthly contributions affect my investment growth?",
        a: "Even small monthly contributions make a huge difference over time due to compounding. Adding $100/month to a $10,000 investment at 8% for 30 years results in over $200,000 more than the lump sum alone.",
      },
      {
        q: "What is the difference between nominal and real rate of return?",
        a: "The nominal rate is before adjusting for inflation. The real rate = nominal rate − inflation rate. For true purchasing power growth, always evaluate returns in real (inflation-adjusted) terms.",
      },
    ],
  },

  "savings-calculator": {
    title: "Savings Calculator – Grow Your Savings with Interest",
    metaDesc:
      "Calculate how your savings grow over time. Find out how much to save monthly to reach your financial goal — emergency fund, vacation, or down payment.",
    h1Override: "Savings Calculator",
    aboutText:
      "A savings calculator helps you project the growth of your savings account or recurring deposit over time, factoring in the starting balance, regular contributions, and compound interest. It answers two key questions: how much will I have if I save X per month, and how much must I save monthly to reach a specific goal? Use it for emergency funds, vacation planning, down payments, and education funds.",
    howToUse: [
      "Enter your current savings balance (or 0 if starting fresh).",
      "Input your planned monthly deposit amount.",
      "Set the annual interest rate of your savings account or FD.",
      "Choose the time horizon and click Calculate to see your projected savings balance.",
    ],
    formula: "Balance = P(1+r)^n + PMT × [(1+r)^n − 1] / r",
    example:
      "Starting with $1,000, adding $300/month at 4.5% for 5 years: final balance = $22,189. Total interest earned = $3,189.",
    faqs: [
      {
        q: "How much should I have in an emergency fund?",
        a: "Most financial advisors recommend 3–6 months of essential living expenses. If your monthly expenses are $3,000, aim for a $9,000–$18,000 emergency fund in a liquid, interest-bearing account.",
      },
      {
        q: "What is the best account for short-term savings?",
        a: "High-yield savings accounts, money market accounts, and short-term CDs are ideal for goals within 1–5 years. They offer liquidity with better-than-average interest rates.",
      },
      {
        q: "How do I save $10,000 in one year?",
        a: "You need to save approximately $833 per month. Any interest earned accelerates this slightly. The key is automating transfers to a dedicated savings account right after each paycheck.",
      },
      {
        q: "Does the savings calculator account for taxes on interest?",
        a: "The calculator shows gross interest. In India, interest above ₹10,000/year from savings accounts is taxable. In the US, savings interest is taxed as ordinary income. Consult a tax advisor for your specific situation.",
      },
    ],
  },

  "cd-calculator": {
    title: "CD Calculator – Certificate of Deposit Returns & APY",
    metaDesc:
      "Calculate how much a Certificate of Deposit (CD) or Fixed Deposit will earn. Compare interest, APY, and maturity value for different terms and rates.",
    h1Override: "CD (Certificate of Deposit) Calculator",
    aboutText:
      "A CD (Certificate of Deposit) calculator shows the maturity value and total interest earned on a fixed-term deposit. CDs pay a guaranteed fixed rate for a set period (3 months to 5 years), making them risk-free savings vehicles insured by the FDIC in the US (up to $250,000). The formula is A = P × (1 + r/n)^(n×t), identical to compound interest but with a fixed, locked-in rate. In India, bank FDs work on the same principle.",
    howToUse: [
      "Enter the deposit amount (principal) you plan to invest.",
      "Input the annual interest rate (APY) offered by your bank or credit union.",
      "Select the CD term — typically 3, 6, 12, 24, or 60 months.",
      "Choose compounding frequency (usually daily or monthly) and calculate your maturity value.",
    ],
    formula: "Maturity Value = P × (1 + r/n)^(n × t)",
    example:
      "A $10,000 CD at 5% APY compounded monthly for 2 years: maturity value = $11,049.41. Total interest = $1,049.41.",
    faqs: [
      {
        q: "What is APY vs APR on a CD?",
        a: "APR is the stated annual rate before compounding. APY (Annual Percentage Yield) includes the effect of compounding and represents the actual return. Always compare CDs using APY.",
      },
      {
        q: "What happens if I withdraw from a CD early?",
        a: "Most CDs charge an early withdrawal penalty, typically 3–12 months of interest depending on the term. Some 'no-penalty' or 'liquid' CDs allow early withdrawal but offer lower rates.",
      },
      {
        q: "Is a CD better than a savings account?",
        a: "CDs generally offer higher rates than savings accounts but lock your money for a set term. Use a CD for money you won't need until maturity; keep your emergency fund in a liquid savings account.",
      },
      {
        q: "Are CD earnings taxable?",
        a: "Yes. In the US, CD interest is taxed as ordinary income in the year it is earned (even if not withdrawn). In India, FD interest is added to your income and taxed at your applicable slab rate, with TDS deducted by the bank.",
      },
    ],
  },

  "student-loan-calculator": {
    title: "Student Loan Calculator – Monthly Payment & Payoff Time",
    metaDesc:
      "Calculate your student loan monthly payment, total interest, and payoff date. Compare standard, extended, and income-based repayment plans for federal and private loans.",
    h1Override: "Student Loan Calculator",
    aboutText:
      "A student loan calculator helps borrowers estimate monthly payments, total interest, and time to payoff for education loans. It uses standard amortization math: Payment = P × r(1+r)^n / [(1+r)^n − 1]. Federal student loans in the US offer multiple repayment plans (Standard, Graduated, Income-Based); private loans typically follow standard amortization. Understanding the numbers before borrowing — or before choosing a repayment plan — can save thousands of dollars.",
    howToUse: [
      "Enter your total student loan balance (all loans combined).",
      "Input the weighted average interest rate of your loans.",
      "Select the repayment term (Standard is 10 years for federal loans).",
      "Calculate to see the monthly payment, total interest, and a year-by-year payoff chart.",
    ],
    formula: "Monthly Payment = P × [r(1+r)^n] / [(1+r)^n − 1]",
    example:
      "$40,000 in student loans at 6.5% on a 10-year standard plan: monthly payment = $454. Total interest paid = $14,487.",
    faqs: [
      {
        q: "Should I pay off student loans early or invest?",
        a: "If your student loan interest rate is above 6%–7%, paying it off early is often the better guaranteed return. If it is below that, investing in diversified equities may yield more over time. Consider both strategies.",
      },
      {
        q: "What is the difference between subsidized and unsubsidized federal loans?",
        a: "Subsidized loans do not accrue interest while you are enrolled at least half-time. Unsubsidized loans accrue interest from disbursement. The difference can add thousands of dollars by graduation.",
      },
      {
        q: "What is student loan refinancing and should I do it?",
        a: "Refinancing replaces one or more loans with a new private loan at a lower rate. It can save money but surrenders federal protections like income-driven repayment and forgiveness programs. Do not refinance federal loans unless you are confident you will not need those benefits.",
      },
      {
        q: "What is the Public Service Loan Forgiveness (PSLF) program?",
        a: "PSLF forgives remaining federal loan balances after 120 qualifying monthly payments while working full-time for a qualifying government or non-profit employer. Use our calculator with a 10-year horizon to estimate your payments before forgiveness.",
      },
    ],
  },

  "income-tax-calculator": {
    title: "Income Tax Calculator 2025–26 – India & USA",
    metaDesc:
      "Calculate your income tax for India (New & Old Regime) and the USA. Get slab-wise breakdown, deductions, surcharge, cess, and take-home salary estimate.",
    h1Override: "Income Tax Calculator",
    aboutText:
      "An income tax calculator computes your annual tax liability based on your gross income, applicable deductions, and the tax slabs of your country. For India, it supports both the New Tax Regime (default from FY 2023-24) and the Old Tax Regime with deductions under Section 80C, HRA, and standard deduction. For the US, it applies federal marginal tax brackets and the standard or itemized deduction. Understanding your tax liability helps in salary negotiation, investment planning, and advance tax payment.",
    howToUse: [
      "Select your country (India or USA) and the applicable financial year.",
      "Enter your gross annual income from salary, business, or other sources.",
      "For India: choose New or Old Regime and enter deductions (80C, HRA, etc.).",
      "Click Calculate to see your taxable income, slab-wise tax, surcharge, cess, and net take-home.",
    ],
    formula:
      "Tax = Sum of (Income in each slab × Slab rate). Net Tax = Tax − Rebate + Surcharge + Cess.",
    example:
      "India New Regime FY 2025-26: Gross income ₹12,00,000, standard deduction ₹75,000, taxable income ₹11,25,000, estimated tax ≈ ₹1,12,500 + 4% cess = ₹1,17,000.",
    faqs: [
      {
        q: "Which tax regime is better — New or Old — in India?",
        a: "The New Regime offers lower slab rates but fewer deductions. The Old Regime is better if you have significant deductions (80C: ₹1.5L, HRA, home loan interest). Use our calculator to compare both regimes with your actual numbers.",
      },
      {
        q: "What is the income tax rebate under Section 87A?",
        a: "Under the New Regime (FY 2025-26), if your taxable income is up to ₹7,00,000, you get a full rebate (tax becomes zero). Under the Old Regime, the rebate applies up to ₹5,00,000.",
      },
      {
        q: "What are the US federal income tax brackets for 2025?",
        a: "For 2025, the US has seven brackets: 10%, 12%, 22%, 24%, 32%, 35%, and 37%. Each bracket applies only to the income within that range, not to all income. The standard deduction for a single filer is $15,000.",
      },
      {
        q: "Is TDS the same as income tax?",
        a: "TDS (Tax Deducted at Source) is an advance payment of income tax deducted by your employer or bank. It is credited against your total tax liability. If TDS exceeds your actual tax, you receive a refund; if less, you must pay the balance.",
      },
    ],
  },

  "bmi-calculator": {
    title: "BMI Calculator – Body Mass Index for Adults & Kids",
    metaDesc:
      "Calculate your BMI (Body Mass Index) in metric or imperial units. Find out if you are underweight, normal, overweight, or obese using WHO guidelines.",
    h1Override: "BMI Calculator",
    aboutText:
      "BMI (Body Mass Index) is a widely used screening tool that estimates body fat based on height and weight. The formula is BMI = weight (kg) / height (m)². WHO classifies BMI below 18.5 as underweight, 18.5–24.9 as normal weight, 25–29.9 as overweight, and 30+ as obese. While BMI does not directly measure body fat, it is a useful population-level screening tool. Asian adults may use lower thresholds (overweight at 23+).",
    howToUse: [
      "Select your preferred unit system: metric (kg/cm) or imperial (lb/ft-in).",
      "Enter your current weight.",
      "Enter your height.",
      "Click Calculate to see your BMI value, weight category, and the healthy weight range for your height.",
    ],
    formula: "BMI = weight (kg) ÷ [height (m)]²   |   Imperial: BMI = 703 × weight (lb) ÷ [height (in)]²",
    example:
      "A person weighing 75 kg and standing 175 cm tall: BMI = 75 / (1.75)² = 24.5 (Normal weight).",
    faqs: [
      {
        q: "What is a healthy BMI range?",
        a: "WHO defines a healthy BMI as 18.5–24.9 for most adults. For Asian adults, a healthy range is often considered 18.5–22.9, with overweight starting at 23.",
      },
      {
        q: "Is BMI accurate for athletes and bodybuilders?",
        a: "BMI can overestimate body fat in muscular individuals (like athletes) because muscle weighs more than fat. A 6-foot bodybuilder with very low body fat may show an 'overweight' BMI. Waist circumference or DEXA scans provide a better picture.",
      },
      {
        q: "Can children use the same BMI calculator?",
        a: "No. For children and teens (2–19 years), BMI is interpreted using age- and sex-specific percentile charts, not the adult ranges. Our calculator provides standard adult BMI; for children, consult a pediatric growth chart.",
      },
      {
        q: "What is the difference between BMI and body fat percentage?",
        a: "BMI is a simple ratio of weight to height. Body fat percentage measures the actual proportion of fat mass to total body mass, which is more informative. A normal-weight person can still have high body fat ('skinny fat'), which BMI will not detect.",
      },
    ],
  },

  "bmr-calculator": {
    title: "BMR Calculator – Basal Metabolic Rate & Daily Calories",
    metaDesc:
      "Calculate your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula. Find out the minimum calories your body needs at rest before accounting for activity.",
    h1Override: "BMR Calculator",
    aboutText:
      "BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest to maintain vital functions like breathing, circulation, and cell repair. The most accurate modern formula is the Mifflin-St Jeor equation: For men: BMR = 10W + 6.25H − 5A + 5; for women: BMR = 10W + 6.25H − 5A − 161, where W is weight in kg, H is height in cm, and A is age in years. Multiply BMR by an activity factor to get TDEE (Total Daily Energy Expenditure).",
    howToUse: [
      "Enter your weight (kg or lbs), height (cm or inches), and age.",
      "Select your biological sex for accurate formula application.",
      "Click Calculate to see your BMR in calories per day.",
      "Use the activity multiplier table to estimate your Total Daily Energy Expenditure (TDEE).",
    ],
    formula:
      "Men: BMR = 10×W + 6.25×H − 5×A + 5   |   Women: BMR = 10×W + 6.25×H − 5×A − 161",
    example:
      "A 30-year-old woman weighing 65 kg and 165 cm tall: BMR = 10×65 + 6.25×165 − 5×30 − 161 = 650 + 1031.25 − 150 − 161 = 1,370 calories/day.",
    faqs: [
      {
        q: "What is the difference between BMR and TDEE?",
        a: "BMR is your calorie burn at complete rest. TDEE (Total Daily Energy Expenditure) is BMR multiplied by your activity level, representing total calories burned in a day including exercise and daily movement.",
      },
      {
        q: "Which BMR formula is most accurate — Harris-Benedict or Mifflin-St Jeor?",
        a: "The Mifflin-St Jeor equation (1990) is considered more accurate than the original Harris-Benedict (1919). Studies show it predicts resting metabolic rate within 10% for most people.",
      },
      {
        q: "Does BMR change with age?",
        a: "Yes. BMR decreases by roughly 1%–2% per decade after age 20, primarily due to loss of lean muscle mass. Strength training can help offset this decline by maintaining muscle.",
      },
      {
        q: "How do I use my BMR to lose weight?",
        a: "Calculate your TDEE (BMR × activity factor). To lose weight, create a calorie deficit of 300–500 kcal/day below TDEE. Avoid eating below your BMR for extended periods, as this can slow metabolism and cause muscle loss.",
      },
    ],
  },

  "calorie-deficit-calculator": {
    title: "Calorie Deficit Calculator – Daily Calories for Weight Loss",
    metaDesc:
      "Calculate the calorie deficit needed to lose weight at your target rate. Find your TDEE, daily calorie goal, and estimated weeks to reach your target weight.",
    h1Override: "Calorie Deficit Calculator",
    aboutText:
      "A calorie deficit calculator determines how many calories below your maintenance level (TDEE) you should eat to lose weight at a sustainable pace. One pound of fat contains approximately 3,500 calories, so a deficit of 500 kcal/day leads to roughly 1 lb (0.45 kg) of weight loss per week. The calculator uses your BMR via the Mifflin-St Jeor equation multiplied by your activity factor, then subtracts your target deficit.",
    howToUse: [
      "Enter your weight, height, age, and biological sex to calculate your BMR.",
      "Select your activity level to compute your TDEE (maintenance calories).",
      "Enter your weight loss goal (e.g., 0.5 kg or 1 lb per week).",
      "Click Calculate to see your daily calorie target and estimated time to reach your goal weight.",
    ],
    formula: "Daily Calorie Goal = TDEE − Deficit. Deficit = 3,500 kcal per 1 lb (7,700 kcal per 1 kg) of fat per week.",
    example:
      "TDEE of 2,200 kcal/day minus a 500 kcal daily deficit = 1,700 kcal/day goal. Expected loss: ~0.5 kg per week.",
    faqs: [
      {
        q: "How big a calorie deficit is safe?",
        a: "A deficit of 300–600 kcal/day is generally considered safe and sustainable, resulting in 0.3–0.6 kg of fat loss per week. Deficits larger than 1,000 kcal/day risk muscle loss, nutrient deficiency, and metabolic adaptation.",
      },
      {
        q: "Why am I not losing weight despite a calorie deficit?",
        a: "Common reasons include underestimating food intake, overestimating calorie burn, water retention masking fat loss, or metabolic adaptation. Recalculate your TDEE every 5–10 kg of weight change.",
      },
      {
        q: "What is a calorie deficit vs calorie restriction?",
        a: "A calorie deficit is a deliberate gap between calories eaten and calories burned. Calorie restriction often implies a more severe reduction. A modest deficit that is sustainable long-term is far more effective than aggressive restriction.",
      },
      {
        q: "Do I need to count calories to lose weight?",
        a: "Not necessarily, but calorie awareness helps. Many people succeed with portion control, eating whole foods, and reducing processed foods without explicit counting. The calculator gives you a target; how you hit it is flexible.",
      },
    ],
  },

  "ideal-weight-calculator": {
    title: "Ideal Weight Calculator – Healthy Weight Range by Height",
    metaDesc:
      "Find your ideal body weight range based on height using multiple formulas (Devine, Robinson, Miller, BMI method). Supports metric and imperial units.",
    h1Override: "Ideal Weight Calculator",
    aboutText:
      "An ideal weight calculator provides a reference weight range for a given height using established medical formulas. Common methods include the Devine formula (widely used in clinical settings), the Robinson formula, the Miller formula, and the BMI-based range (weight for BMI 18.5–24.9). None of these defines a universal optimum — body composition, bone density, and muscle mass all matter — but they provide a useful benchmark for health discussions.",
    howToUse: [
      "Select metric (cm/kg) or imperial (ft-in/lb) units.",
      "Enter your height.",
      "Select your biological sex (many formulas differ by sex).",
      "Click Calculate to see ideal weight estimates from multiple formulas and your healthy BMI weight range.",
    ],
    formula:
      "Devine (men): 50 + 2.3 × (height in inches − 60)   |   Devine (women): 45.5 + 2.3 × (height in inches − 60)",
    example:
      "A 5'8\" (172 cm) male: Devine ideal weight = 50 + 2.3×8 = 68.4 kg. BMI healthy range (18.5–24.9) = 59–80 kg.",
    faqs: [
      {
        q: "Is ideal weight the same as goal weight?",
        a: "Not necessarily. Ideal weight formulas give a clinical reference point. Your personal goal weight should account for muscle mass, body composition, athletic performance, and medical advice.",
      },
      {
        q: "Why do different formulas give different ideal weights?",
        a: "Each formula was developed from different populations and purposes. The Devine formula was originally used in pharmacology for drug dosing. The BMI method is based on population health statistics. Using a range from multiple formulas is more informative than any single number.",
      },
      {
        q: "What is a healthy weight for a 5'5\" woman?",
        a: "Using the BMI healthy range (18.5–24.9), a healthy weight for a 5'5\" (165 cm) woman is approximately 51–69 kg (112–152 lbs). The Devine formula gives an ideal of approximately 55.5 kg.",
      },
      {
        q: "Should I try to reach the exact ideal weight shown by the calculator?",
        a: "These are guidelines, not prescriptions. A person can be healthy at weights above the 'ideal' range if body composition is good. Consult a doctor or dietitian before setting a weight loss target.",
      },
    ],
  },

  "ovulation-calculator": {
    title: "Ovulation Calculator – Fertile Window & Peak Ovulation Days",
    metaDesc:
      "Calculate your ovulation date and fertile window based on your last period and cycle length. Boost your chances of conception with accurate fertility tracking.",
    h1Override: "Ovulation Calculator",
    aboutText:
      "An ovulation calculator estimates the most fertile days of your menstrual cycle, typically the 5-day window leading up to and including ovulation. In a standard 28-day cycle, ovulation occurs around Day 14 (approximately 14 days before the next period). Ovulation day = First day of last period + (cycle length − 14). The fertile window spans 5 days before ovulation and 1 day after, as sperm can survive up to 5 days in the fallopian tubes.",
    howToUse: [
      "Enter the first day of your last menstrual period (LMP).",
      "Input your average cycle length (most women range from 21–35 days).",
      "Click Calculate to see your estimated ovulation date and the full fertile window.",
      "Track consistently for 2–3 months to identify your personal cycle pattern.",
    ],
    formula: "Ovulation Day ≈ LMP + (Cycle Length − 14 days)",
    example:
      "Last period started March 1, cycle length 28 days: ovulation ≈ March 15. Fertile window: March 10–16.",
    faqs: [
      {
        q: "How accurate is an ovulation calculator?",
        a: "It is an estimate based on average cycle patterns. Actual ovulation can vary by several days due to stress, illness, or hormonal fluctuations. For greater accuracy, combine with basal body temperature (BBT) tracking or ovulation predictor kits (OPKs).",
      },
      {
        q: "Can I get pregnant outside the fertile window?",
        a: "The chance is very low but not zero. Sperm can survive 3–5 days, and ovulation timing can vary. The 6-day fertile window (5 days before + ovulation day) captures the vast majority of conception opportunities.",
      },
      {
        q: "What if my cycle is irregular?",
        a: "An irregular cycle (varying by 7+ days) makes calendar-based prediction less reliable. Ovulation predictor kits that detect the LH surge and period-tracking apps that learn your patterns over time are better tools.",
      },
      {
        q: "Does ovulation always happen on Day 14?",
        a: "Only in a textbook 28-day cycle. In a 25-day cycle, ovulation is around Day 11. In a 35-day cycle, it is around Day 21. The consistent part is that ovulation typically occurs 14 days BEFORE the next period, not 14 days after the last.",
      },
    ],
  },

  "period-calculator": {
    title: "Period Calculator – Next Period Date & Cycle Tracker",
    metaDesc:
      "Predict your next period date, cycle length, and menstrual phase. Track upcoming periods for the next 12 months with our free period calculator.",
    h1Override: "Period Calculator",
    aboutText:
      "A period calculator predicts your upcoming menstrual cycle dates based on your last period start date and average cycle length. A typical cycle ranges from 21 to 35 days, with the average being 28 days. The calculator projects the start dates of your next several periods and identifies your follicular phase, ovulation window, luteal phase, and menstruation window within each cycle. It helps with event planning, travel, and fertility awareness.",
    howToUse: [
      "Enter the first day of your most recent period.",
      "Input your average cycle length in days (check your last 3 months for accuracy).",
      "Optionally enter your average period duration (how many days your period lasts).",
      "Click Calculate to see the projected dates of your next 6–12 periods and each phase of your cycle.",
    ],
    formula: "Next Period Start = Last Period Start + Cycle Length",
    example:
      "Last period: January 5, cycle length: 28 days. Next period: February 2, then March 2, then March 30.",
    faqs: [
      {
        q: "What is considered a normal menstrual cycle length?",
        a: "A normal cycle ranges from 21 to 35 days, measured from the first day of one period to the first day of the next. Cycles shorter than 21 or longer than 35 days may warrant a conversation with a gynecologist.",
      },
      {
        q: "Why did my period come earlier than predicted?",
        a: "Cycle length varies naturally from month to month. Stress, travel, illness, weight changes, and hormonal fluctuations can all shift ovulation timing, making the period arrive earlier or later than a fixed-date prediction.",
      },
      {
        q: "How long does a typical period last?",
        a: "Most periods last 3–7 days, with the heaviest flow on days 1–2. Periods shorter than 2 days or longer than 7 days, or very heavy flow, may be worth discussing with a doctor.",
      },
      {
        q: "Can I use a period calculator for birth control?",
        a: "The calendar/rhythm method has a high failure rate (up to 25%) as a sole contraceptive method because cycle length varies. If avoiding pregnancy, use a reliable contraceptive method and consult a healthcare provider.",
      },
    ],
  },

  "percentage-calculator": {
    title: "Percentage Calculator – %, Increase, Decrease & Change",
    metaDesc:
      "Calculate percentages instantly. Find X% of Y, what percent X is of Y, and percentage increase or decrease between two numbers. Fast and free.",
    h1Override: "Percentage Calculator",
    aboutText:
      "A percentage calculator handles the three most common percentage problems: (1) What is X% of Y? (Answer: X/100 × Y), (2) X is what percent of Y? (Answer: X/Y × 100), and (3) What is the percentage change from X to Y? (Answer: (Y−X)/X × 100). Percentages appear everywhere — discounts, taxes, tip calculations, grade point averages, interest rates, and statistical reporting — making this one of the most universally useful calculators.",
    howToUse: [
      "Select the type of percentage problem: 'X% of Y', 'X is what % of Y', or 'Percentage change'.",
      "Enter the relevant numbers in the input fields.",
      "Click Calculate to instantly see the answer with the formula shown.",
      "Use the percentage change mode to compare two values — for example, salary before and after a raise.",
    ],
    formula:
      "X% of Y = X/100 × Y   |   X is what % of Y = (X÷Y)×100   |   % change = (New−Old)/Old × 100",
    example:
      "What is 15% of $85? Answer: 0.15 × 85 = $12.75. What is the % increase from 80 to 96? Answer: (96−80)/80 × 100 = 20%.",
    faqs: [
      {
        q: "How do I calculate a percentage on a calculator?",
        a: "For X% of Y: multiply Y × X ÷ 100. For percentage change: (new value − old value) ÷ old value × 100. Our calculator does this automatically for all three common scenarios.",
      },
      {
        q: "What is 20% of 150?",
        a: "20% of 150 = 0.20 × 150 = 30.",
      },
      {
        q: "What is the percentage increase from 50 to 75?",
        a: "(75 − 50) / 50 × 100 = 50% increase.",
      },
      {
        q: "How do I find what percentage one number is of another?",
        a: "Divide the part by the whole and multiply by 100. For example, 30 is what percent of 200? 30 ÷ 200 × 100 = 15%.",
      },
    ],
  },

  "gpa-calculator": {
    title: "GPA Calculator – Calculate Cumulative GPA & Grade Points",
    metaDesc:
      "Calculate your GPA for one semester or cumulatively. Enter your grades and credit hours to get your Grade Point Average on a 4.0 scale instantly.",
    h1Override: "GPA Calculator",
    aboutText:
      "A GPA (Grade Point Average) calculator computes your academic performance on a standard 4.0 scale by weighting each course grade by its credit hours. The formula is GPA = Sum(Grade Points × Credit Hours) / Total Credit Hours. Most US universities use a 4.0 scale where A=4.0, B=3.0, C=2.0, D=1.0, and F=0. Cumulative GPA is calculated across all semesters. Use this calculator to track academic progress, determine honor roll eligibility, or forecast the impact of upcoming grades.",
    howToUse: [
      "Enter each course name (optional), the grade received (A, B+, C, etc.), and the course credit hours.",
      "Add as many courses as needed using the 'Add Course' button.",
      "For cumulative GPA, enter your previous GPA and total credits earned alongside the current semester.",
      "Click Calculate to see your semester GPA and updated cumulative GPA.",
    ],
    formula: "GPA = Σ(Grade Points × Credit Hours) ÷ Total Credit Hours",
    example:
      "Courses: Math (A, 3 credits = 12 pts), English (B+, 3 credits = 9.99 pts), Chemistry (B, 4 credits = 12 pts). GPA = (12+9.99+12)/10 = 3.40.",
    faqs: [
      {
        q: "What is a good GPA in college?",
        a: "A GPA of 3.5–4.0 is generally considered excellent and qualifies for most honor roll programs. A 3.0 is considered a 'B' average and is the minimum for many graduate school programs. Below 2.0 risks academic probation.",
      },
      {
        q: "How do I convert letter grades to GPA points?",
        a: "Standard 4.0 scale: A/A+=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0. Some schools use plus/minus; others use only whole numbers.",
      },
      {
        q: "Can one bad grade ruin my GPA?",
        a: "One bad grade has less impact on cumulative GPA the more courses you have completed. Use the calculator to see the exact impact. For example, one F in a 3-credit course when you have 60 credits at 3.5 GPA drops you to approximately 3.38.",
      },
      {
        q: "Is a 4.0 GPA hard to achieve?",
        a: "Maintaining a 4.0 requires an A in every course, which is challenging but achievable with consistent effort. Many competitive graduate programs and scholarships require a 3.7+, making a 3.8–3.9 still highly competitive.",
      },
    ],
  },

  "grade-calculator": {
    title: "Grade Calculator – Final Exam Score Needed & Weighted Grade",
    metaDesc:
      "Calculate your current grade, weighted average, and what score you need on the final exam to achieve your target grade. Free and easy to use.",
    h1Override: "Grade Calculator",
    aboutText:
      "A grade calculator computes your current class average from individual assignment, test, and project scores, each weighted by its contribution to the final grade. It also solves the reverse problem: given your current grade and the weight of the final exam, what score do you need on the final to achieve a target course grade? Formula: Required Final Score = (Target Grade − Current Grade × (1 − Final Weight)) / Final Weight.",
    howToUse: [
      "Enter each graded component (homework, midterm, quiz) along with your score and its weight percentage.",
      "Ensure the weights sum to 100% (or the calculator will normalize them).",
      "Set your target final course grade (e.g., 90% for an A-).",
      "Click Calculate to see your current weighted grade and the score required on the final exam.",
    ],
    formula:
      "Weighted Grade = Σ(Score × Weight) / Σ(Weight)   |   Required Final = (Target − Current × (1 − w_final)) / w_final",
    example:
      "Midterm 78% (30% weight), Homework 92% (20%), Quizzes 85% (10%), Final 40%. Target: 85%. Current weighted: 83.4%. Required final score: 88%.",
    faqs: [
      {
        q: "How is a weighted grade calculated?",
        a: "Multiply each component score by its percentage weight, sum the products, and divide by the sum of weights. For example, a midterm score of 80 worth 30% contributes 24 points (0.30 × 80) to your grade.",
      },
      {
        q: "What score do I need on the final to pass the class?",
        a: "Use the 'Required Final Score' mode. Enter your current grade on all other components and their weights, set your target passing grade (e.g., 60%), and the calculator will tell you the minimum final exam score needed.",
      },
      {
        q: "What if my grade weights don't add up to 100%?",
        a: "Our calculator normalizes weights automatically. However, double-check your syllabus — missing a graded component (like a project) could mean a zero is being excluded, which would overstate your current standing.",
      },
      {
        q: "How do professors calculate final grades with plus/minus grades?",
        a: "Most professors convert percentage grades to letter grades at the end: 93–100=A, 90–92=A-, 87–89=B+, 83–86=B, 80–82=B-, etc. Check your course syllabus for the exact scale used.",
      },
    ],
  },

  "age-calculator": {
    title: "Age Calculator – Exact Age in Years, Months & Days",
    metaDesc:
      "Calculate your exact age in years, months, weeks, and days. Find the number of days until your next birthday or between any two dates.",
    h1Override: "Age Calculator",
    aboutText:
      "An age calculator computes the exact time elapsed between two dates, typically a birthdate and today. It returns age in years, months, and days, and can also calculate the number of days, weeks, or hours lived. Beyond personal age, it is useful for legal age verification, anniversary tracking, contract duration calculations, and historical date research. Leap years are accounted for in the day-level calculation.",
    howToUse: [
      "Enter your date of birth (or any start date) using the date picker.",
      "The end date defaults to today, or enter a custom end date for between-date calculations.",
      "Click Calculate to see your exact age in years, months, and days.",
      "View additional details: total days lived, weeks, days until next birthday, and day of the week you were born.",
    ],
    formula: "Age = End Date − Start Date (accounting for calendar month lengths and leap years)",
    example:
      "Born: March 15, 1990. Today: October 11, 2026. Age = 36 years, 6 months, 26 days. Total days lived = 13,360.",
    faqs: [
      {
        q: "How do I calculate my exact age in days?",
        a: "Subtract your birthdate from today's date. Our calculator accounts for leap years (366-day years) automatically and returns the precise number of days.",
      },
      {
        q: "What day of the week was I born?",
        a: "Our age calculator includes the day of the week for any birth date. For example, March 15, 1990 was a Thursday.",
      },
      {
        q: "How many days until my next birthday?",
        a: "The calculator shows the exact number of days from today until your next birthday by computing the next occurrence of your birth month and day.",
      },
      {
        q: "Does the age calculator work for any two dates, not just birthdays?",
        a: "Yes. Enter any start and end date to find the exact duration between them — useful for project timelines, work anniversaries, contract periods, or historical events.",
      },
    ],
  },

  "fuel-cost-calculator": {
    title: "Fuel Cost Calculator – Trip Fuel Cost & Mileage Estimate",
    metaDesc:
      "Calculate fuel cost for any trip. Enter distance, fuel efficiency, and fuel price to get total fuel cost in USD or INR. Great for road trips and daily commutes.",
    h1Override: "Fuel Cost Calculator",
    aboutText:
      "A fuel cost calculator estimates the total fuel expenditure for a trip based on distance, vehicle fuel efficiency (miles per gallon or km/L), and current fuel prices. Formula: Fuel Cost = (Distance / Efficiency) × Fuel Price Per Unit. It supports both MPG (miles per gallon) for US drivers and KMPL (kilometres per litre) for Indian drivers, and can calculate daily, monthly, or annual fuel budgets for regular commuters.",
    howToUse: [
      "Enter the total trip distance in miles or kilometres.",
      "Input your vehicle's fuel efficiency (MPG or KMPL — check your car's manual or dashboard).",
      "Enter the current fuel price per gallon (US) or per litre (India).",
      "Click Calculate to see the estimated fuel cost and number of litres/gallons required.",
    ],
    formula: "Fuel Cost = (Distance ÷ Fuel Efficiency) × Price per Unit",
    example:
      "Road trip of 500 km, car does 15 KMPL, petrol costs ₹105/litre: Fuel needed = 33.3 L. Total cost = ₹3,500.",
    faqs: [
      {
        q: "How do I calculate fuel cost for a road trip?",
        a: "Divide the total distance by your car's fuel efficiency to get litres/gallons needed, then multiply by the current fuel price. Our calculator does this instantly with any unit system.",
      },
      {
        q: "How can I reduce my fuel costs?",
        a: "Maintain steady speed, keep tires properly inflated, avoid heavy acceleration, reduce AC use at low speeds, and ensure your engine is tuned. Carpooling and route optimization also cut fuel expenses significantly.",
      },
      {
        q: "What is good fuel economy for a car?",
        a: "In India, 15–20 KMPL is considered good for a petrol car. In the US, 30–40 MPG is considered fuel-efficient for a non-hybrid. Hybrids and EVs achieve 50+ MPGe.",
      },
      {
        q: "How much does it cost to drive 1,000 km in India?",
        a: "At 15 KMPL and ₹105/litre: 1,000/15 × 105 = ₹7,000. At 20 KMPL: ₹5,250. Driving a fuel-efficient car saves thousands over an annual commute.",
      },
    ],
  },

  "scientific-calculator": {
    title: "Scientific Calculator – Trig, Log, Powers & More Online",
    metaDesc:
      "Free online scientific calculator with trigonometric functions, logarithms, exponents, square roots, factorials, and memory functions. No download needed.",
    h1Override: "Scientific Calculator",
    aboutText:
      "An online scientific calculator provides advanced mathematical functions beyond basic arithmetic, including trigonometric functions (sin, cos, tan and their inverses), logarithms (log base 10 and natural log), exponents, roots, factorials, and constants like π and e. It is an essential tool for high school and college students in physics, chemistry, engineering, and mathematics, replacing the need for a physical calculator like the Casio FX-991 or TI-84.",
    howToUse: [
      "Use the keypad or your keyboard to enter numbers and mathematical expressions.",
      "Select degree or radian mode before using trigonometric functions.",
      "Use parentheses to ensure correct order of operations in complex expressions.",
      "Use memory functions (M+, MR, MC) to store and recall intermediate values.",
    ],
    formula: "Supports: sin/cos/tan, sin⁻¹/cos⁻¹/tan⁻¹, log, ln, x², x^y, √x, n!, π, e, and more.",
    example:
      "sin(30°) = 0.5   |   log(1000) = 3   |   e^2 = 7.389   |   5! = 120   |   √144 = 12",
    faqs: [
      {
        q: "How do I calculate sine, cosine, and tangent online?",
        a: "Use our scientific calculator: switch to degree mode (DEG), enter the angle, and press sin, cos, or tan. For radians, switch to RAD mode. Example: sin(45°) = 0.7071.",
      },
      {
        q: "What is the difference between log and ln?",
        a: "log (common logarithm) uses base 10: log(100) = 2. ln (natural logarithm) uses base e ≈ 2.718: ln(e) = 1. Use ln for calculus and exponential growth; use log for pH, decibels, and Richter scale.",
      },
      {
        q: "How do I calculate exponents on a scientific calculator?",
        a: "Use the x^y or ^ button. Enter the base, press x^y, enter the exponent, and press equals. For example, 2^10 = 1024.",
      },
      {
        q: "Can this calculator solve quadratic equations?",
        a: "Our scientific calculator handles individual expressions. For full quadratic equation solving (ax²+bx+c=0), use our dedicated Quadratic Equation Calculator which applies the quadratic formula and shows both roots.",
      },
    ],
  },

  "roi-calculator": {
    title: "ROI Calculator – Return on Investment % & Net Profit",
    metaDesc:
      "Calculate Return on Investment (ROI) as a percentage and net profit. Use for stocks, real estate, business investments, or any financial decision.",
    h1Override: "ROI Calculator",
    aboutText:
      "ROI (Return on Investment) measures the profitability of an investment relative to its cost. The formula is ROI (%) = (Net Profit / Investment Cost) × 100, where Net Profit = Final Value − Initial Cost. Annualized ROI accounts for the time held: Annualized ROI = (1 + ROI)^(1/years) − 1. ROI is used to compare the efficiency of different investments, evaluate business decisions, and measure marketing campaign performance.",
    howToUse: [
      "Enter the initial investment amount (cost of investment).",
      "Enter the final value or total return received from the investment.",
      "Optionally enter the holding period in years for annualized ROI.",
      "Click Calculate to see ROI percentage, net profit, and annualized return.",
    ],
    formula:
      "ROI = (Final Value − Initial Cost) / Initial Cost × 100   |   Annualized ROI = (1 + ROI)^(1/years) − 1",
    example:
      "Bought stock for $5,000, sold for $7,500 after 3 years. ROI = 50%. Annualized ROI = (1.5)^(1/3) − 1 = 14.5% per year.",
    faqs: [
      {
        q: "What is a good ROI for an investment?",
        a: "A 'good' ROI depends on the asset class and risk. US stock market historically delivers ~10% annually. Real estate: 8%–12%. Savings accounts: 3%–5%. Any ROI above your opportunity cost (e.g., market return) is considered good.",
      },
      {
        q: "How is ROI different from IRR?",
        a: "ROI is a simple total return percentage without accounting for time value of money or cash flows during the period. IRR (Internal Rate of Return) is a more sophisticated metric that accounts for the timing and magnitude of cash flows.",
      },
      {
        q: "Can ROI be negative?",
        a: "Yes. A negative ROI means you lost money on the investment. For example, buying a stock at $1,000 and selling at $700 gives ROI = (700−1000)/1000 × 100 = −30%.",
      },
      {
        q: "How do I calculate ROI for a rental property?",
        a: "ROI for rental = (Annual Rental Income − Annual Expenses) / Total Property Cost × 100. Include mortgage payments, maintenance, property tax, and insurance in expenses. A common benchmark is 8%–10% annual ROI for rental properties.",
      },
    ],
  },

  "profit-margin-calculator": {
    title: "Profit Margin Calculator – Gross, Net & Operating Margin",
    metaDesc:
      "Calculate gross profit margin, net profit margin, and markup percentage. Essential for small business owners, retailers, and freelancers pricing their services.",
    h1Override: "Profit Margin Calculator",
    aboutText:
      "A profit margin calculator determines the profitability of a product or business. Gross Profit Margin = (Revenue − COGS) / Revenue × 100. Net Profit Margin = Net Profit / Revenue × 100. Markup = (Price − Cost) / Cost × 100. These metrics are critical for pricing products, evaluating business health, and comparing performance against industry benchmarks. Retail margins typically run 20%–50%; software and services can be 60%–80%.",
    howToUse: [
      "Enter the selling price (revenue) of your product or service.",
      "Input the cost of goods sold (COGS) or cost to deliver the service.",
      "For net margin, include operating expenses and taxes in the cost field.",
      "Click Calculate to see gross profit, profit margin %, and markup %.",
    ],
    formula:
      "Gross Margin % = (Revenue − COGS) / Revenue × 100   |   Markup % = (Revenue − COGS) / COGS × 100",
    example:
      "Product sells for $150, costs $90 to produce. Gross profit = $60. Margin = 40%. Markup = 66.7%.",
    faqs: [
      {
        q: "What is the difference between profit margin and markup?",
        a: "Profit margin is profit as a percentage of selling price. Markup is profit as a percentage of cost. A product with $10 cost and $15 price has a 33.3% margin but a 50% markup. Confusing these leads to pricing errors.",
      },
      {
        q: "What is a good profit margin for a small business?",
        a: "It varies by industry. Restaurants: 3%–9%. Retail: 2%–5%. Software: 60%–80%. Professional services: 15%–30%. Compare your margin to industry averages rather than a single universal benchmark.",
      },
      {
        q: "How do I price a product to achieve a 40% margin?",
        a: "Use the formula: Price = Cost / (1 − Desired Margin). For a 40% margin: Price = Cost / 0.60. If your cost is $60, sell at $100 to achieve a 40% profit margin.",
      },
      {
        q: "How is gross margin different from net margin?",
        a: "Gross margin subtracts only the direct cost of goods (COGS) from revenue. Net margin subtracts all expenses including operating costs, salaries, rent, taxes, and interest. Net margin gives a truer picture of overall profitability.",
      },
    ],
  },

  "discount-calculator": {
    title: "Discount Calculator – Sale Price & Savings After Discount",
    metaDesc:
      "Calculate the sale price, discount amount, and savings for any percentage off. Useful for shopping, pricing, and comparing deals. Supports stacked discounts.",
    h1Override: "Discount Calculator",
    aboutText:
      "A discount calculator quickly computes the final sale price and total savings after applying a percentage discount to an original price. Formula: Sale Price = Original Price × (1 − Discount% / 100). For stacked discounts (e.g., 20% off + an additional 10% off), the discounts are applied sequentially, not additively: first discount gives 80% of original, second gives 90% of that = 72% of original, not 70%. This tool is essential for shoppers during sales events and for retailers setting promotional prices.",
    howToUse: [
      "Enter the original (full) price of the item.",
      "Input the discount percentage (e.g., 25 for 25% off).",
      "For stacked discounts, add a second discount percentage in the additional field.",
      "Click Calculate to see the final price, total discount amount, and percentage saved.",
    ],
    formula:
      "Sale Price = Original Price × (1 − Discount / 100)   |   Savings = Original Price − Sale Price",
    example:
      "A $200 jacket at 30% off: Sale price = $200 × 0.70 = $140. Savings = $60. With an extra 10% off: $140 × 0.90 = $126.",
    faqs: [
      {
        q: "How do I calculate a percentage discount?",
        a: "Multiply the original price by the discount percentage divided by 100, then subtract from the original: Sale Price = Price × (1 − Discount%/100). For 25% off $80: $80 × 0.75 = $60.",
      },
      {
        q: "What is a double discount (stacked discount)?",
        a: "A double discount applies two discounts sequentially. 20% off + another 10% off is NOT 30% off. It is: Price × 0.80 × 0.90 = 72% of original, saving 28%, not 30%.",
      },
      {
        q: "How do I calculate the original price from a discounted price?",
        a: "If a sale price is $75 after 25% off: Original = Sale Price / (1 − Discount%) = $75 / 0.75 = $100.",
      },
      {
        q: "Is GST calculated on the original or discounted price in India?",
        a: "In India, GST is generally applied on the transaction value — i.e., the discounted price if the discount is given at the time of sale and is clearly stated on the invoice.",
      },
    ],
  },

  "budget-calculator": {
    title: "Budget Calculator – Monthly Budget Planner & Expense Tracker",
    metaDesc:
      "Create a complete monthly budget. Enter your income and expenses to see where your money goes, find savings opportunities, and track budget vs actual spending.",
    h1Override: "Monthly Budget Calculator",
    aboutText:
      "A budget calculator helps you allocate your income across spending categories to ensure you live within your means and save consistently. The popular 50/30/20 rule allocates 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment. By entering your actual income and expenses, you can see your net balance, identify overspending categories, and plan adjustments. Budgeting is the foundation of every financial goal — from building an emergency fund to paying off debt.",
    howToUse: [
      "Enter your monthly take-home income (after taxes and deductions).",
      "Input your fixed expenses: rent/mortgage, car payment, insurance, subscriptions.",
      "Add variable expenses: groceries, dining, entertainment, clothing, utilities.",
      "View your total expenses, remaining balance, and how your budget compares to the 50/30/20 guideline.",
    ],
    formula: "Net Monthly Balance = Total Income − Total Expenses. Savings Rate = Savings / Income × 100.",
    example:
      "Monthly income: $4,500. Fixed expenses: $2,000. Variable expenses: $1,200. Savings: $1,300. Savings rate: 28.9%.",
    faqs: [
      {
        q: "What is the 50/30/20 budgeting rule?",
        a: "The 50/30/20 rule suggests spending 50% of take-home pay on needs (housing, food, utilities), 30% on wants (dining out, entertainment, subscriptions), and 20% on savings and debt payoff. It is a flexible starting framework.",
      },
      {
        q: "What expenses should I include in a monthly budget?",
        a: "Include: rent/mortgage, utilities, groceries, transportation, insurance, subscriptions, dining out, entertainment, clothing, medical, savings contributions, and loan repayments. Track everything for at least one month to find hidden spending.",
      },
      {
        q: "How much should I spend on rent according to my budget?",
        a: "The classic rule is to spend no more than 30% of gross income on housing. In high-cost cities, many people exceed this; try to keep all fixed housing costs (rent + utilities) below 35% of take-home pay.",
      },
      {
        q: "What is zero-based budgeting?",
        a: "Zero-based budgeting assigns every rupee/dollar of income a specific purpose so that Income − Expenses = 0. Unlike the 50/30/20 method, it requires detailed tracking of every category, making it more rigorous but also more effective for aggressive savers.",
      },
    ],
  },

  "debt-payoff-calculator": {
    title: "Debt Payoff Calculator – Fastest Way to Pay Off Debt",
    metaDesc:
      "Calculate how long it takes to pay off credit card or loan debt. Compare snowball vs avalanche methods and see how extra payments reduce interest and payoff time.",
    h1Override: "Debt Payoff Calculator",
    aboutText:
      "A debt payoff calculator shows you how long it will take to eliminate debt at your current payment rate and how much interest you will pay in total. Two popular strategies are the Debt Avalanche (pay highest-interest debt first to minimize total interest) and the Debt Snowball (pay smallest balance first for psychological wins). The calculator models both approaches and shows the total interest savings from paying more than the minimum.",
    howToUse: [
      "Enter each debt: name, current balance, interest rate (APR), and minimum payment.",
      "Input any extra monthly amount you can apply toward debt payoff.",
      "Select either the Avalanche (lowest total cost) or Snowball (fastest wins) strategy.",
      "Click Calculate to see the payoff order, total interest paid, and debt-free date.",
    ],
    formula: "Months to Payoff = −log(1 − r×Balance/Payment) / log(1+r), where r = monthly interest rate.",
    example:
      "Credit card: $5,000 balance at 20% APR, $150/month minimum. Payoff: 50 months, total interest $2,507. Add $100 extra: 33 months, saves $948.",
    faqs: [
      {
        q: "What is the debt snowball vs debt avalanche method?",
        a: "Snowball: pay minimum on all debts, throw extra money at the smallest balance first. Fast psychological wins keep you motivated. Avalanche: target highest APR first. Mathematically optimal — saves the most total interest.",
      },
      {
        q: "How much faster will I pay off debt if I double my payments?",
        a: "Doubling payments dramatically cuts payoff time. A $5,000 credit card at 20% APR with $100/month takes 94 months. With $200/month: just 32 months, saving over 5 years and thousands in interest.",
      },
      {
        q: "Should I pay off debt or save/invest?",
        a: "If your debt interest rate exceeds your expected investment return (typically 6%–7%), pay off debt first. Always contribute enough to get your employer's 401(k) match first — that's a guaranteed 50%–100% return. Then pay off high-interest debt before investing further.",
      },
      {
        q: "What is the minimum payment trap on credit cards?",
        a: "Paying only the minimum (often 1%–2% of balance) keeps you in debt for decades and costs far more in interest. On a $10,000 balance at 19% APR, minimum payments take 30+ years and cost over $15,000 in interest.",
      },
    ],
  },

  "sales-tax-calculator": {
    title: "Sales Tax Calculator – Add or Remove Tax from Any Price",
    metaDesc:
      "Calculate sales tax, GST, or VAT for any price. Add tax to find the final price, or reverse-calculate to find the pre-tax price from a tax-inclusive amount.",
    h1Override: "Sales Tax Calculator",
    aboutText:
      "A sales tax calculator computes the tax amount and final price for any purchase. Forward calculation: Final Price = Original Price × (1 + Tax Rate/100). Reverse calculation: Pre-tax Price = Final Price / (1 + Tax Rate/100). It supports US state sales tax (0%–10.25%), Indian GST (5%, 12%, 18%, 28%), UK VAT (20%), and any custom rate. Use it at checkout, for business invoicing, or to verify receipts.",
    howToUse: [
      "Enter the original (pre-tax) price of the item or service.",
      "Input the applicable tax rate: your US state's sales tax, Indian GST rate, or any custom percentage.",
      "Select whether you want to add tax to the price or remove it from a tax-inclusive total.",
      "Click Calculate to see the tax amount and final price or pre-tax price.",
    ],
    formula:
      "Add tax: Final Price = Price × (1 + Rate/100)   |   Remove tax: Pre-tax = Final Price / (1 + Rate/100)",
    example:
      "Item priced at $120 with 8.5% sales tax: Tax = $10.20. Final price = $130.20. Reverse: $130.20 / 1.085 = $120.",
    faqs: [
      {
        q: "What is the sales tax rate in my US state?",
        a: "US state sales tax rates range from 0% (Oregon, Montana, New Hampshire, Delaware) to over 10% in combined state+local rates (Louisiana, Tennessee). Always check your local rate as city and county taxes add to the state rate.",
      },
      {
        q: "What is the GST rate in India?",
        a: "India's GST has four main rate slabs: 5% (essential goods), 12% (standard goods), 18% (most services and goods), and 28% (luxury items, sin goods). Some goods like fresh food are zero-rated.",
      },
      {
        q: "How do I calculate tax-inclusive vs tax-exclusive prices?",
        a: "Tax-exclusive: add tax to the base price. Tax-inclusive: the price already contains tax; reverse-calculate by dividing by (1 + rate). For 18% GST on ₹1,180 inclusive price: pre-tax = ₹1,180/1.18 = ₹1,000.",
      },
      {
        q: "Do online purchases include sales tax?",
        a: "In the US, since the 2018 South Dakota v. Wayfair ruling, most states require online retailers to collect sales tax even without a physical presence. Check your state's rules and the retailer's policy at checkout.",
      },
    ],
  },
};
