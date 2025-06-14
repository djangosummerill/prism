-- CHATS TABLE
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default now()
);

-- MESSAGES TABLE
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model text, -- nullable, can store model name or be null
  created_at timestamp with time zone default now()
);

-- INDEXES FOR PERFORMANCE
create index if not exists idx_chats_user_id on chats (user_id);
create index if not exists idx_messages_chat_id on messages (chat_id);
create index if not exists idx_messages_chat_id_created_at
  on messages (chat_id, created_at);

-- ENABLE RLS
alter table chats enable row level security;
alter table messages enable row level security;

-- RLS POLICIES FOR CHATS
-- Only allow users to access their own chats
create policy "Allow user to select their own chats"
  on chats for select
  using (user_id = auth.uid());

create policy "Allow user to insert their own chats"
  on chats for insert
  with check (user_id = auth.uid());

create policy "Allow user to update their own chats"
  on chats for update
  using (user_id = auth.uid());

create policy "Allow user to delete their own chats"
  on chats for delete
  using (user_id = auth.uid());

-- RLS POLICIES FOR MESSAGES
-- Only allow users to access messages in their own chats
create policy "Allow user to select messages in their chats"
  on messages for select
  using (
    chat_id in (
      select id from chats where user_id = auth.uid()
    )
  );

create policy "Allow user to insert messages in their chats"
  on messages for insert
  with check (
    chat_id in (
      select id from chats where user_id = auth.uid()
    )
  );

create policy "Allow user to update messages in their chats"
  on messages for update
  using (
    chat_id in (
      select id from chats where user_id = auth.uid()
    )
  );

create policy "Allow user to delete messages in their chats"
  on messages for delete
  using (
    chat_id in (
      select id from chats where user_id = auth.uid()
    )
  );