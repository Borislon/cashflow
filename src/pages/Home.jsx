const Home = () => {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">CashFlow</h1>
      <p className="text-slate-600">
        Проследявай лични и семейни разходи. Следващите екрани се пълнят
        фаза по фаза.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>Разходи — ръчно и от QR (скоро)</li>
        <li>Анализ — месечни графики и лимити</li>
        <li>Семейство — общ бюджет с код за покана</li>
      </ul>
    </section>
  );
};

export default Home;
