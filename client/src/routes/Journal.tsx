import { useState } from 'react';
import JournalEntryCard from '@/components/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual journal entries from store
  const mockEntries = [
    {
      id: '1',
      date: new Date().toISOString(),
      content: 'Today was a good day. I stayed strong and focused on my recovery. Attended my meeting and felt supported by the group. Grateful for another day clean.',
      mood: 8,
      tags: ['gratitude', 'meeting', 'support'],
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      content: 'Struggled with some cravings but reached out to my sponsor. We talked for an hour and I feel much better. Grateful for the support system.',
      mood: 5,
      tags: ['struggle', 'sponsor', 'cravings'],
    },
    {
      id: '3',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      content: 'Celebrated 30 days clean today! The group gave me a chip. Feeling proud and determined to keep going.',
      mood: 9,
      tags: ['milestone', 'celebration', 'gratitude'],
    },
  ];

  const filteredEntries = mockEntries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-4">Journal</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </header>

      {/* New Entry Button */}
      <Button
        className="w-full gap-2 h-12"
        data-testid="button-new-entry"
      >
        <Plus className="h-5 w-5" />
        New Journal Entry
      </Button>

      {/* Entries */}
      <section className="space-y-4" aria-label="Journal entries">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No entries found' : 'No journal entries yet'}
            </p>
            {!searchQuery && (
              <Button variant="outline" data-testid="button-create-first">
                Create your first entry
              </Button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              date={entry.date}
              content={entry.content}
              mood={entry.mood}
              tags={entry.tags}
              onClick={() => console.log('Edit entry:', entry.id)}
            />
          ))
        )}
      </section>
    </div>
  );
}
