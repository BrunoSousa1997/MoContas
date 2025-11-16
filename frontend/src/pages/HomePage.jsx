import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

const monthsPT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const INCOME_COLORS = ["#2ecc71", "#27ae60", "#16a085", "#1abc9c", "#3498db", "#2980b9", "#54a0ff"];
const EXPENSE_COLORS = ["#e74c3c", "#c0392b", "#ff6b6b", "#e67e22", "#d35400", "#f39c12", "#f1c40f"];
const expenseCategories = ["Alimentação", "Transporte", "Habitação", "Saúde", "Educação", "Lazer", "Outros"];
const incomeCategories = ["Salário", "OutrosReceita"];
const currentYear = new Date().getFullYear();

export default function HomePage({ darkMode, t }) {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(monthsPT[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const API = process.env.REACT_APP_API_ROUTE;
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    // --- Income states ---
    const [incomeOverTime, setIncomeOverTime] = useState(false);
    const [incomeMonthsCount, setIncomeMonthsCount] = useState("");
    const [incomeEntries, setIncomeEntries] = useState([]); // {month, year, value}
    const [incomeCategory, setIncomeCategory] = useState("Salário");
    const [incomeDescription, setIncomeDescription] = useState("");
    const [incomeTotal, setIncomeTotal] = useState(0);

    // --- Expense states ---
    const [expenseOverTime, setExpenseOverTime] = useState(false);
    const [expenseMonthsCount, setExpenseMonthsCount] = useState("");
    const [expenseEntries, setExpenseEntries] = useState([]); // {month, year, value}
    const [expenseCategory, setExpenseCategory] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [openChart, setOpenChart] = useState(null);

    // Prepare data for charts
    const incomesByCategory = incomeCategories.map(cat => ({
        name: t.categories[cat],
        value: incomes.filter(i => i.category === cat).reduce((sum, i) => sum + (i.value || 0), 0),
    })).filter(i => i.value > 0);

    const expensesByCategory = expenseCategories.map(cat => ({
        name: t.categories[cat],
        value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.value || 0), 0)
    })).filter(i => i.value > 0);

    // Optionally prepare detailed breakdown if needed
    const incomesByCategoryDetail = incomeCategories.map(cat => ({
        category: t.categories[cat],
        data: incomes.filter(i => i.category === cat).map(i => ({ name: i.description, value: i.value }))
    })).filter(g => g.data.length > 0);

    const expensesByCategoryDetail = expenseCategories.map(cat => ({
        category: t.categories[cat],
        data: expenses.filter(e => e.category === cat).map(e => ({ name: e.description, value: e.value }))
    })).filter(g => g.data.length > 0);

    // --- Fetch data ---
    const fetchData = async () => {
        try {
            const resIncomes = await fetch(`${API}/Income/${id}?month=${selectedMonth}&year=${selectedYear}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const resExpenses = await fetch(`${API}/Expense/${id}?month=${selectedMonth}&year=${selectedYear}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataIncomes = resIncomes.ok ? await resIncomes.json() : [];
            const dataExpenses = resExpenses.ok ? await resExpenses.json() : [];
            setIncomes(Array.isArray(dataIncomes) ? dataIncomes : []);
            setExpenses(Array.isArray(dataExpenses) ? dataExpenses : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);

    // --- Helpers for Over Time ---
    const getNextMonths = (startMonth, count) => {
        const startIndex = monthsPT.indexOf(startMonth);
        let months = [];
        for (let i = 0; i < count; i++) {
            const index = (startIndex + i) % 12;
            const yearOffset = Math.floor((startIndex + i) / 12);
            months.push({ month: monthsPT[index], year: currentYear + yearOffset, value: 0 });
        }
        return months;
    };

    const sortEntries = (entries) => {
        return [...entries].sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return monthsPT.indexOf(a.month) - monthsPT.indexOf(b.month);
        });
    };

    const handleIncomeTotalChange = (val) => {
        const parsed = parseFloat(val) || 0;
        setIncomeTotal(parsed);
        if (incomeOverTime && incomeEntries.length > 0) {
            const evenValue = parsed / incomeEntries.length;
            setIncomeEntries(incomeEntries.map(e => ({ ...e, value: evenValue })));
        }
    };

    const handleExpenseTotalChange = (val) => {
        const parsed = parseFloat(val) || 0;
        setExpenseTotal(parsed);
        if (expenseOverTime && expenseEntries.length > 0) {
            const evenValue = parsed / expenseEntries.length;
            setExpenseEntries(expenseEntries.map(e => ({ ...e, value: evenValue })));
        }
    };

    const handleIncomeMonthChange = (index, val) => {
        const newEntries = [...incomeEntries];
        newEntries[index].value = parseFloat(val) || 0;
        setIncomeEntries(newEntries);
        setIncomeTotal(newEntries.reduce((sum, e) => sum + e.value, 0));
    };

    const handleExpenseMonthChange = (index, val) => {
        const newEntries = [...expenseEntries];
        newEntries[index].value = parseFloat(val) || 0;
        setExpenseEntries(newEntries);
        setExpenseTotal(newEntries.reduce((sum, e) => sum + e.value, 0));
    };

    const handleIncomeMonthOrYearChange = (index, key, value) => {
        const newEntries = [...incomeEntries];
        newEntries[index][key] = key === 'year' ? parseInt(value) : value;
        setIncomeEntries(sortEntries(newEntries));
    };

    const handleExpenseMonthOrYearChange = (index, key, value) => {
        const newEntries = [...expenseEntries];
        newEntries[index][key] = key === 'year' ? parseInt(value) : value;
        setExpenseEntries(sortEntries(newEntries));
    };

    const submitIncome = async () => {
        for (let entry of (incomeOverTime ? incomeEntries : [{ month: selectedMonth, year: selectedYear, value: incomeTotal }])) {
            await fetch(`${API}/Income`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: incomeCategory,
                    description: incomeDescription,
                    value: entry.value,
                    month: entry.month,
                    year: entry.year,
                    user: id
                })
            });
        }
        setIncomeTotal(0); setIncomeEntries([]); setIncomeDescription(""); setIncomeCategory("Salário");
        fetchData();
    };

    const submitExpense = async () => {
        for (let entry of (expenseOverTime ? expenseEntries : [{ month: selectedMonth, year: selectedYear, value: expenseTotal }])) {
            await fetch(`${API}/Expense`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: expenseCategory,
                    description: expenseDescription,
                    value: entry.value,
                    month: entry.month,
                    year: entry.year,
                    user: id
                })
            });
        }
        setExpenseTotal(0); setExpenseEntries([]); setExpenseDescription(""); setExpenseCategory("");
        fetchData();
    };

    const removeIncome = async (id) => { await fetch(`${API}/Income/${id}`, { method: "DELETE" }); fetchData(); };
    const removeExpense = async (id) => { await fetch(`${API}/Expense/${id}`, { method: "DELETE" }); fetchData(); };

    const totalIncomes = incomes.reduce((sum, i) => sum + (i.value || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.value || 0), 0);
    const balance = totalIncomes - totalExpenses;

    return (
        <div className={`${darkMode ? "dark" : ""}`}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">

                {/* Month/Year Selector */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-semibold mb-2">
                        {t.selectPeriod || "Select a Period"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Choose the month and year you want to view data for.
                    </p>

                    <div className="flex justify-center gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-fit mx-auto">

                        {/* Month */}
                        <div className="flex flex-col text-left">
                            <label className="text-sm font-medium mb-1">{t.month}</label>
                            <select
                                className="border rounded-xl p-2 dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                            >
                                {monthsPT.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="flex flex-col text-left">
                            <label className="text-sm font-medium mb-1">{t.year}</label>
                            <select
                                className="border rounded-xl p-2 dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedYear}
                                onChange={e => setSelectedYear(parseInt(e.target.value))}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Income Form */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">{t.addIncome}</h2>


                        <div>
                            <label>{t.value}</label>
                            <input type="number" value={incomeTotal} onChange={e => handleIncomeTotalChange(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                        </div>

                        <div>
                            <label>{t.description}</label>
                            <input type="text" value={incomeDescription} onChange={e => setIncomeDescription(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                        </div>

                        <div>
                            <label>{t.category}</label>
                            <select value={incomeCategory} onChange={e => setIncomeCategory(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700">
                                {incomeCategories.map(c => <option key={c} value={c}>{t.categories[c]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>
                                <input type="checkbox" checked={incomeOverTime} onChange={e => {
                                    setIncomeOverTime(e.target.checked);
                                    if (e.target.checked) setIncomeEntries(getNextMonths(selectedMonth, incomeMonthsCount));
                                    else setIncomeEntries([]);
                                }} /> {t.incomesOverTime}
                            </label>
                        </div>
                        {incomeOverTime && (
                            <div>
                                <label>{t.monthsCount}</label>
                                <input type="number" min={1} max={12} value={incomeMonthsCount} onChange={e => {
                                    const count = parseInt(e.target.value) || 1;
                                    setIncomeMonthsCount(count);
                                    setIncomeEntries(getNextMonths(selectedMonth, count));
                                }} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                            </div>
                        )}

                        {incomeOverTime && (
                            <div className="mb-2">
                                {/* Header */}
                                <div className="flex items-center gap-2 font-semibold mb-1">
                                    <div className="w-24 text-center">{t.year}</div>
                                    <div className="w-24 text-center">{t.month}</div>
                                    <div className="flex-1 text-center">{t.value}</div>
                                </div>
                                {/* Entries */}
                                {incomeEntries.map((e, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-1">
                                        <div className="w-24">
                                            <select
                                                value={e.year}
                                                onChange={ev => handleIncomeMonthOrYearChange(i, 'year', ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            >
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <select
                                                value={e.month}
                                                onChange={ev => handleIncomeMonthOrYearChange(i, 'month', ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            >
                                                {monthsPT.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={e.value}
                                                onChange={ev => handleIncomeMonthChange(i, ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-2" onClick={submitIncome}>{t.addButton}</button>
                    </div>

                    {/* Expense Form */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">{t.addExpense}</h2>

                        <div>
                            <label>{t.value}</label>
                            <input type="number" value={expenseTotal} onChange={e => handleExpenseTotalChange(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                        </div>

                        <div>
                            <label>{t.description}</label>
                            <input type="text" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                        </div>

                        <div>
                            <label>{t.category}</label>
                            <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="border p-2 w-full rounded mb-2 dark:bg-gray-700">
                                {expenseCategories.map(c => <option key={c} value={c}>{t.categories[c]}</option>)}
                            </select>
                        </div>


                        <div>
                            <label>
                                <input type="checkbox" checked={expenseOverTime} onChange={e => {
                                    setExpenseOverTime(e.target.checked);
                                    if (e.target.checked) setExpenseEntries(getNextMonths(selectedMonth, expenseMonthsCount));
                                    else setExpenseEntries([]);
                                }} /> {t.expensesOverTime}
                            </label>
                        </div>

                        {expenseOverTime && (
                            <div>
                                <label>{t.monthsCount}</label>
                                <input type="number" min={1} max={12} value={expenseMonthsCount} onChange={e => {
                                    const count = parseInt(e.target.value) || 1;
                                    setExpenseMonthsCount(count);
                                    setExpenseEntries(getNextMonths(selectedMonth, count));
                                }} className="border p-2 w-full rounded mb-2 dark:bg-gray-700" />
                            </div>
                        )}

                        {expenseOverTime && (
                            <div className="mb-2">
                                <div className="flex items-center gap-2 font-semibold mb-1">
                                    <div className="w-24 text-center">{t.year}</div>
                                    <div className="w-24 text-center">{t.month}</div>
                                    <div className="flex-1 text-center">{t.value}</div>
                                </div>
                                {expenseEntries.map((e, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-1">
                                        <div className="w-24">
                                            <select
                                                value={e.year}
                                                onChange={ev => handleExpenseMonthOrYearChange(i, 'year', ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            >
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <select
                                                value={e.month}
                                                onChange={ev => handleExpenseMonthOrYearChange(i, 'month', ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            >
                                                {monthsPT.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={e.value}
                                                onChange={ev => handleExpenseMonthChange(i, ev.target.value)}
                                                className="border p-1 rounded w-full dark:bg-gray-700"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}


                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full mt-2" onClick={submitExpense}>{t.addButton}</button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2>{t.totalIncomes}</h2><p className="text-xl font-semibold text-green-600">{totalIncomes.toFixed(2)} €</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2>{t.totalExpenses}</h2><p className="text-xl font-semibold text-red-600">{totalExpenses.toFixed(2)} €</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2>{t.balance}</h2><p className={`text-xl font-semibold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>{balance.toFixed(2)} €</p>
                    </div>
                </div>
                {/* Chart Buttons */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setOpenChart("incomes")}
                        className={`px-4 py-2 rounded ${openChart === "incomes"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            }`}
                    >
                        {t.incomeChart || "Gráfico Rendimentos"}
                    </button>
                    <button
                        onClick={() => setOpenChart("expenses")}
                        className={`px-4 py-2 rounded ${openChart === "expenses"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            }`}
                    >
                        {t.expenseChart || "Gráfico Despesas"}
                    </button>
                    <button
                        onClick={() => setOpenChart(null)}
                        className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    >
                        {t.hideChart || "Ocultar"}
                    </button>
                </div>

                {/* Incomes Chart */}
                {openChart === "incomes" && incomesByCategory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2">{t.incomeByCategory || "Rendimentos por Categoria"}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={incomesByCategory}
                                    dataKey="value"
                                    nameKey="name"
                                    label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} €`}
                                >
                                    {incomesByCategory.map((entry, index) => (
                                        <Cell key={index} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Incomes per category in 3 columns */}
                {openChart === "incomes" && incomesByCategoryDetail.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {incomesByCategoryDetail.map(group => (
                            <div key={group.category} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                                <h3 className="font-semibold mb-2">{t.incomesIn || "Rendimentos em"} {group.category}</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={group.data}
                                            dataKey="value"
                                            nameKey="name"
                                            label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} €`}
                                        >
                                            {group.data.map((entry, index) => (
                                                <Cell key={index} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                )}

                {/* Expenses Chart */}
                {openChart === "expenses" && expensesByCategory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2">{t.expenseByCategory || "Despesas por Categoria"}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expensesByCategory}
                                    dataKey="value"
                                    nameKey="name"
                                    label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} €`}
                                >
                                    {expensesByCategory.map((entry, index) => (
                                        <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Expenses per category in 3 columns */}
                {openChart === "expenses" && expensesByCategoryDetail.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {expensesByCategoryDetail.map(group => (
                            <div key={group.category} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                                <h3 className="font-semibold mb-2">{t.expensesIn || "Despesas em"} {group.category}</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={group.data}
                                            dataKey="value"
                                            nameKey="name"
                                            label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} €`}
                                        >
                                            {group.data.map((entry, index) => (
                                                <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                )}
                {/* Listagens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">{t.incomes}</h2>
                        {incomes.length === 0 ? (
                            <p>{t.noIncomes || "Nenhum rendimento"}</p>
                        ) : (
                            incomes.map(i => (
                                <div key={i.id} className="flex justify-between border-b dark:border-gray-600 py-1">
                                    <span>{`${t.categories[i.category]}: ${i.description} - ${i.value.toFixed(2)} €`}
                                    </span>
                                    <button onClick={() => removeIncome(i.id)} className="text-red-600">
                                        {t.remove}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">{t.expenses}</h2>
                        {expenses.length === 0 ? (
                            <p>{t.noExpenses || "Nenhuma despesa"}</p>
                        ) : (
                            expenses.map(e => (
                                <div key={e.id} className="flex justify-between border-b dark:border-gray-600 py-1">
                                    <span>{`${t.categories[e.category]}: ${e.description} - ${e.value.toFixed(2)} €`}</span>
                                    <button onClick={() => removeExpense(e.id)} className="text-red-600">
                                        {t.remove}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
