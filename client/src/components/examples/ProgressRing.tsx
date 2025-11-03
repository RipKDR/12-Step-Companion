import ProgressRing from '../ProgressRing';

export default function ProgressRingExample() {
  return (
    <div className="bg-background p-8 flex justify-center">
      <ProgressRing current={7} total={10} stepNumber={1} />
    </div>
  );
}
