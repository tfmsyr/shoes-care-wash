import { Card} from "@/components/ui/card"

const services = [
  { name: "Premium Care", total: 120 },
  { name: "Basic Wash", total: 95 },
  { name: "Deep Clean", total: 60 },
  { name: "Express Wash", total: 40 },
];

export default function TopServices() {
  return (
    <Card>
      <p className="text-sm font-semibold mb-4">Top Services</p>
      <ul className="space-y-3">
        {services.map((service, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span>{service.name}</span>
            <span className="font-semibold">{service.total}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
