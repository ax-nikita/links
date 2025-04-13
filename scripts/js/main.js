(() => {
    function getCost(type, base_price, price, qty) {
        let
            qty_m = qty;

        if (qty <= 0) {
            return 0;
        }

        console.dir(type);

        switch (type) {
            case "buy":
                qty_m *= -1;
                break;
            case "sell":
                qty_m *= 1;
                break;
            default:
                break;
        }

        new_price = (qty_m / (rg_pull / ((price + base_price * 3) / 4)) + 1) * price;
        transaction_price = (new_price * 3 + price) / 4 * qty;

        price = new_price;

        return {
            'new_price': price,
            'cost': transaction_price
        };
    }

    let
        get_data = new axRequest('d.json'),
        base_prices = {
            'steel': 5,
            'gold': 5,
            'silver': 5,
            'copper': 1,
        },
        rg_pull = 3000;

    new axModularFunction('price', (el) => {
        let
            type = el.axAttribute('bar'),
            base_price = base_prices[type],
            price = base_price,
            stock = 0;

        get_data.execute([], (accounting) => {
            let
                type_accounting = JSON.parse(accounting)[type];

            type_accounting.forEach((transaction) => {
                let
                    qty = transaction.qty;

                stock = transaction.stock;

                if (qty <= 0) {
                    return;
                }

                let
                    result = getCost(transaction.type, base_price, price, qty);

                price = result.new_price;
            });

            el.axQS('.price__in-stock strong').axVal(stock);
            el.axQS('.price__rg').axVal(Math.round(price * 10) / 10 + ' r.g.');

            el.click();
        });

        el.addEventListener('click', () => {
            axQS('.calc')
                .axAttribute('type', type)
                .axAttribute('price', price)
                .axAttribute('base_price', base_price);
            axQS('.calc span').axVal(el.axQS('span').axVal());
            axQS('.calc').update();
        });


    });

    new axModularFunction('calc', (el) => {
        el.update = () => {
            let
                price = el.axAttribute('price') * 1,
                base_price = el.axAttribute('base_price'),
                qty = el.axQS('input').axVal(),
                type = el.axQS('select').value;

            switch (type) {
                case "buy":
                    type = "sell";
                    break;
                case "sell":
                    type = "buy";
                    break;
            }

            let
                result = getCost(type, base_price, price, qty);

            el.axQS('.calc__cost').axVal(Math.round(result.cost));
        }

        el.axQSA('input, select').forEach((input) => (
                input.addEventListener('change', () => {
                    el.update();
                })
            )
        );
    });
})();
