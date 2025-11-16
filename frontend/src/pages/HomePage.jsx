import React, { useContext, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { translations } from "../translations";
import ReactCountryFlag from "react-country-flag";
import Tooltip from "../Components/Tooltip";
import { TranslationContext } from "../Components/TranslationContext/TranslationContext";
const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const expenseCategories = [
    "Alimentação", "Transporte", "Habitação", "Saúde", "Educação", "Lazer", "Outros"
];

const incomeCategories = [
    "Salário", "Outros"
];

// Função para traduzir para a língua atual
const getMonth = (monthPT, lang) => {
    if (lang === "pt") return monthPT;

    const monthsEN = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const index = months.indexOf(monthPT);
    return index >= 0 ? monthsEN[index] : monthPT;
};
const currentYear = new Date().getFullYear();

export default function HomePage({ darkMode, lang}) {
    const { t } = useContext(TranslationContext);
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [incomeInput, setIncomeInput] = useState({
        category: "Salário",
        description: "",
        value: "",
        month: months[new Date().getMonth()],
        installments: 1,
        year: currentYear
    });

    const [expenseInput, setExpenseInput] = useState({
        category: "",
        description: "",
        value: "",
        installments: 1,   // 👈 novo campo
        month: months[new Date().getMonth()],
        year: currentYear
    });

    const [openChart, setOpenChart] = useState(null);

    const API = process.env.REACT_APP_API_ROUTE;
    const id = localStorage.getItem("userId"); // Get the JWT from storage

    const fetchData = async () => {
        const token = localStorage.getItem("token"); // Get the JWT from storage
        try {
            const resIncomes = await fetch(`${API}/Income/${id}?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const resExpenses = await fetch(`${API}/Expense/${id}?month=${selectedMonth}&year=${selectedYear}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const dataIncomes = resIncomes.ok ? await resIncomes.json() : [];
            const dataExpenses = resExpenses.ok ? await resExpenses.json() : [];

            setIncomes(Array.isArray(dataIncomes) ? dataIncomes : []);
            setExpenses(Array.isArray(dataExpenses) ? dataExpenses : []);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, id]);

    // Sempre que o valor ou o número de parcelas mudar, recalcula as parcelas
    const addIncome = async () => {
        if (!incomeInput.category || !incomeInput.value) return;
        const totalValue = parseFloat(incomeInput.value);
        const installments = parseInt(incomeInput.installments) || 1;
        const installmentValue = totalValue / installments;

        let monthIndex = months.indexOf(incomeInput.month);
        let year = incomeInput.year;

        for (let i = 0; i < installments; i++) {
            const currentMonthIndex = (monthIndex + i) % 12;
            const month = months[currentMonthIndex];
            const currentYear = year + Math.floor((monthIndex + i) / 12);

            await fetch(`${API}/Income`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: incomeInput.category,
                    description: installments > 1
                        ? `${incomeInput.description} (${i + 1}/${installments})`
                        : incomeInput.description,
                    value: installmentValue,
                    month,
                    year: currentYear,
                    user: id
                })
            });
        }

        setIncomeInput({
            category: "Salário",
            description: "",
            value: "",
            installments: 1,
            month: selectedMonth,
            year: selectedYear
        });

        fetchData();
    };

    const addExpense = async () => {
        if (!expenseInput.category || !expenseInput.value) {
            alert("Dados em falta!");
            return
        };

        const installmentsArray = expenseInput.installmentsArray || [];
        const installmentsLength = installmentsArray.length;

        // Validação 1: somatório das parcelas
        const totalInstallmentsValue = installmentsArray.reduce(
            (sum, inst) => sum + (parseFloat(inst.value) || 0),
            0
        );

        if (installmentsLength > 1 && totalInstallmentsValue !== parseFloat(expenseInput.value)) {
            alert("O valor total deve ser igual ao somatório das parcelas!");
            return;
        }

        // Validação 2: meses em ordem correta
        const monthsPT = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
        ];

        for (let i = 1; i < installmentsLength; i++) {
            const prevIndex = monthsPT.indexOf(installmentsArray[i - 1].month) + (installmentsArray[i - 1].year - installmentsArray[0].year) * 12;
            const currIndex = monthsPT.indexOf(installmentsArray[i].month) + (installmentsArray[i].year - installmentsArray[0].year) * 12;

            if (currIndex <= prevIndex) {
                alert("Os meses das parcelas devem estar em ordem crescente!");
                return;
            }
        }

        // Monta as parcelas
        const finalInstallments = installmentsArray.map((inst, i) => ({
            month: inst.month,
            year: inst.year,
            value: inst.value,
            description: installmentsLength > 1
                ? `${expenseInput.description} (${i + 1}/${installmentsLength})`
                : expenseInput.description,
        }));
        if (finalInstallments.length) {
            // Cria cada parcela
            for (let inst of finalInstallments) {
                await fetch(`${API}/Expense`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        category: expenseInput.category,
                        description: inst.description,
                        value: inst.value,
                        month: inst.month,
                        year: inst.year,
                        user: id
                    }),
                });
            }
        }
        else {
            // Cria uma unica despesa
            await fetch(`${API}/Expense`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: expenseInput.category,
                    description: expenseInput.description,
                    value: expenseInput.value,
                    month: expenseInput.month,
                    year: expenseInput.year,
                    user: id
                }),
            });
        }

        // Reset do formulário
        setExpenseInput({
            category: "",
            description: "",
            value: "",
            installments: 1,
            month: selectedMonth,
            year: selectedYear,
            installmentsArray: [],
        });

        fetchData();
    };

    const removeIncome = async (id) => {
        await fetch(`${API}/Income/${id}`, { method: "DELETE" });
        fetchData();
    };

    const removeExpense = async (id) => {
        await fetch(`${API}/Expense/${id}`, { method: "DELETE" });
        fetchData();
    };

    const totalIncomes = incomes.reduce((sum, i) => sum + (i.value || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.value || 0), 0);
    const balance = totalIncomes - totalExpenses;

    // overall by category (you already have)
    const incomesByCategory = incomeCategories.map(cat => ({
        name: cat,
        value: incomes.filter(i => i.category === cat).reduce((sum, i) => sum + i.value, 0),
    })).filter(i => i.value > 0);

    const expensesByCategory = expenseCategories.map(cat => ({
        name: cat,
        value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.value, 0),
    })).filter(e => e.value > 0);

    // per-category breakdown (descriptions)
    const incomesByCategoryDetail = incomeCategories.map(cat => ({
        category: cat,
        data: incomes.filter(i => i.category === cat).map(i => ({
            name: i.description || "No description",
            value: i.value
        }))
    })).filter(group => group.data.length > 0);

    const expensesByCategoryDetail = expenseCategories.map(cat => ({
        category: cat,
        data: expenses.filter(e => e.category === cat).map(e => ({
            name: e.description || "No description",
            value: e.value
        }))
    })).filter(group => group.data.length > 0);

    const INCOME_COLORS = [
        "#2ecc71", // Verde
        "#27ae60", // Verde escuro
        "#16a085", // Verde azulado
        "#1abc9c", // Turquesa
        "#3498db", // Azul
        "#2980b9", // Azul escuro
        "#54a0ff"  // Azul claro
    ];

    // Cores para DESPESAS (tons de vermelho e laranja)
    const EXPENSE_COLORS = [
        "#e74c3c", // Vermelho
        "#c0392b", // Vermelho escuro
        "#ff6b6b", // Vermelho claro
        "#e67e22", // Laranja
        "#d35400", // Laranja escuro
        "#f39c12", // Amarelo queimado
        "#f1c40f"  // Amarelo vivo
    ]; const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <div className={`${darkMode ? "dark" : ""}`}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">


                {/* Seletor Mês / Ano */}
                <div className="flex gap-2 mb-6">
                    <select
                        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={selectedMonth}
                        onChange={e => {
                            setSelectedMonth(e.target.value);
                            setIncomeInput({ ...incomeInput, month: e.target.value });
                            setExpenseInput({ ...expenseInput, month: e.target.value });
                        }}
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={selectedYear}
                        onChange={e => {
                            setSelectedYear(parseInt(e.target.value));
                            setIncomeInput({ ...incomeInput, year: parseInt(e.target.value) });
                            setExpenseInput({ ...expenseInput, year: parseInt(e.target.value) });
                        }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Income Form */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-6">Adicionar Rendimento</h2>
                        <select
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={incomeInput.category}
                            onChange={e => setIncomeInput({ ...incomeInput, category: e.target.value })}
                        >
                            <option value="">Categoria</option>
                            {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Descrição"
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={incomeInput.description}
                            onChange={e => setIncomeInput({ ...incomeInput, description: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Valor"
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={incomeInput.value}
                            onChange={e => setIncomeInput({ ...incomeInput, value: e.target.value })}
                        />
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
                            onClick={addIncome}
                        >
                            Adicionar
                        </button>
                    </div>

                    {/* Expense Form */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-6">Adicionar Despesa</h2>
                        <select
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={expenseInput.category}
                            onChange={e => setExpenseInput({ ...expenseInput, category: e.target.value })}
                        >
                            <option value="">Categoria</option>
                            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Descrição"
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={expenseInput.description}
                            onChange={e => setExpenseInput({ ...expenseInput, description: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Valor"
                            className="border p-2 w-full rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={expenseInput.value}
                            onChange={e => setExpenseInput({ ...expenseInput, value: e.target.value })}
                        />
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full transition"
                            onClick={addExpense}
                        >
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2 className="text-gray-500 dark:text-gray-300">Rendimentos</h2>
                        <p className="text-xl font-semibold text-green-600">{totalIncomes.toFixed(2)} €</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2 className="text-gray-500 dark:text-gray-300">Despesas</h2>
                        <p className="text-xl font-semibold text-red-600">{totalExpenses.toFixed(2)} €</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
                        <h2 className="text-gray-500 dark:text-gray-300">Saldo</h2>
                        <p className={`text-xl font-semibold ${balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {balance.toFixed(2)} €
                        </p>
                    </div>
                </div>

                {/* Botões Gráficos */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setOpenChart("incomes")}
                        className={`px-4 py-2 rounded ${openChart === "incomes" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"}`}
                    >
                        Gráfico Rendimentos
                    </button>
                    <button
                        onClick={() => setOpenChart("expenses")}
                        className={`px-4 py-2 rounded ${openChart === "expenses" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"}`}
                    >
                        Gráfico Despesas
                    </button>
                    <button
                        onClick={() => setOpenChart(null)}
                        className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    >
                        Ocultar
                    </button>
                </div>

                {/* Gráfico Incomes */}
                {openChart === "incomes" && incomesByCategory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2">Rendimentos por Categoria</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={incomesByCategory} dataKey="value" nameKey="name" label>
                                    {incomesByCategory.map((entry, index) => (
                                        <Cell key={index} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {openChart === "incomes" && incomesByCategoryDetail.map(group => (
                    <div key={group.category} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2"> {t.incomesIn} {group.category} </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={group.data} dataKey="value" nameKey="name" label> {group.data.map((entry, index) => (<Cell key={index} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />))} </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>))}

                {/* Gráfico Expenses */}
                {openChart === "expenses" && expensesByCategory.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2">Despesas por Categoria</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={expensesByCategory} dataKey="value" nameKey="name" label>
                                    {expensesByCategory.map((entry, index) => (
                                        <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {openChart === "expenses" && expensesByCategoryDetail.map(group => (
                    <div key={group.category} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
                        <h2 className="font-semibold mb-2"> {t.expensesIn} {group.category} </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={group.data} dataKey="value" nameKey="name" label> {group.data.map((entry, index) => (
                                    <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                ))} 
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>))}

                {/* Listagens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Rendimentos</h2>
                        {incomes.length === 0 ? (
                            <p>Nenhum rendimento</p>
                        ) : (
                            incomes.map(i => (
                                <div key={i.id} className="flex justify-between border-b dark:border-gray-600 py-1">
                                    <span>{i.category}: {i.description} - {i.value.toFixed(2)} €</span>
                                    <button onClick={() => removeIncome(i.id)} className="text-red-600">Remover</button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Despesas</h2>
                        {expenses.length === 0 ? (
                            <p>Nenhuma despesa</p>
                        ) : (
                            expenses.map(e => (
                                <div key={e.id} className="flex justify-between border-b dark:border-gray-600 py-1">
                                    <span>{e.category}: {e.description} - {e.value.toFixed(2)} €</span>
                                    <button onClick={() => removeExpense(e.id)} className="text-red-600">Remover</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}

