import { Card } from "@/components/ui/card"

const products = [
  { name: "Engine Oil", sold: 220 },
  { name: "Car Shampoo", sold: 180 },
  { name: "Tire Cleaner", sold: 120 },
  { name: "Microfiber Cloth", sold: 100 },
];

export default function TopProducts() {
  return (
    <Card>
      <p className="text-sm font-semibold mb-4">Top Selling Products</p>
      <ul className="space-y-3">
        {products.map((product, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span>{product.name}</span>
            <span className="font-semibold">{product.sold}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
