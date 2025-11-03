import SobrietyCounter from '../SobrietyCounter';

export default function SobrietyCounterExample() {
  // 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return (
    <div className="bg-background">
      <SobrietyCounter 
        cleanDate={thirtyDaysAgo.toISOString()} 
        timezone="Australia/Melbourne"
      />
    </div>
  );
}
