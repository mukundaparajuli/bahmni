import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, description, link, disabled, onClick }) => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {link ? (
            <Link to={link}>
                <Button disabled={disabled}>Go to {title}</Button>
            </Link>
        ) : (
            <Button onClick={onClick} disabled={disabled} className={disabled === true ? "cursor-not-allowed" : ""}>
                {title}
            </Button>
        )}
    </div>
);

export default DashboardCard;