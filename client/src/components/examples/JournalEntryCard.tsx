import JournalEntryCard from '../JournalEntryCard';

export default function JournalEntryCardExample() {
  return (
    <div className="bg-background p-4 space-y-4">
      <JournalEntryCard
        date={new Date().toISOString()}
        content="Today was a good day. I stayed strong and focused on my recovery. Attended my meeting and felt supported by the group."
        mood={8}
        tags={['gratitude', 'meeting', 'support']}
        onClick={() => console.log('Entry clicked')}
      />
      <JournalEntryCard
        date={new Date(Date.now() - 86400000).toISOString()}
        content="Struggled with some cravings but reached out to my sponsor. Grateful for the support system."
        mood={5}
        tags={['struggle', 'sponsor']}
        onClick={() => console.log('Entry clicked')}
      />
    </div>
  );
}
