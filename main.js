import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://rgiwxrvpvptsaktrwjdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to generate anonymous ID
function getAnonymousId() {
  let id = localStorage.getItem('anonymousId');
  if (!id) {
    id = 'User' + Math.floor(Math.random() * 10000);
    localStorage.setItem('anonymousId', id);
  }
  return id;
}

// Chatbot logic
async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';
  input.disabled = true;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-or-v1-...yourkey...',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are a warm, supportive assistant for MindBridge, a mental health web app for students. Be gentle, concise, and helpful.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "Sorry, I didn’t get that.";
    appendMessage('bot', botReply);
  } catch (error) {
    appendMessage('bot', "Oops. Something went wrong.");
    console.error(error);
  }

  input.disabled = false;
}

function appendMessage(sender, text) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.classList.add('chat-message', `chat-${sender}`);
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// DOM Loaded Event
window.addEventListener('DOMContentLoaded', () => {
  // Mood Check-In
  const moodForm = document.getElementById('mood-form');
  if (moodForm) {
    moodForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const mood = document.getElementById('mood').value;
      const note = document.getElementById('note').value;

      const { error } = await supabase.from('checkins').insert([{ mood, note }]);
      const message = document.getElementById('response-message');

      if (error) {
        console.error('Check-in error:', error);
        message.textContent = '❌ Could not save your check-in. Try again.';
      } else {
        message.textContent = '✅ Check-in saved!';
        moodForm.reset();
        fetchMoodHistory();
      }
    });
  }

  // Forum Post
  const forumForm = document.getElementById('forum-form');
  if (forumForm) {
    forumForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('post-content').value.trim();
      const anonymous_id = getAnonymousId();

      if (!content) return;
      const { error } = await supabase.from('posts').insert([{ content, anonymous_id }]);

      if (error) {
        alert('Error posting: ' + error.message);
      } else {
        document.getElementById('post-content').value = '';
        fetchPosts();
      }
    });
  }

  // Contact Form
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseBox = document.getElementById('form-response');

    const { error } = await supabase.from('messages').insert([{ name, email, message }]);

    responseBox.textContent = error ? '❌ Something went wrong.' : '✅ Message sent successfully!';
    if (!error) document.getElementById('contact-form').reset();
  });

  // RSVP Form
  document.getElementById('rsvp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value;
    const email = document.getElementById('rsvp-email').value;
    const event = document.getElementById('event-name').value;
    const { error } = await supabase.from('rsvps').insert([{ name, email, event }]);
    const response = document.getElementById('rsvp-response');

    response.textContent = error ? '❌ Failed to RSVP. Try again.' : '✅ You are now registered!';
    if (!error) document.getElementById('rsvp-form').reset();
  });

  // OTP Auth Form
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const msg = document.getElementById('auth-message');

    const { error } = await supabase.auth.signInWithOtp({ email });
    msg.textContent = error ? "❌ Login failed." : "✅ Check your email for the login link.";
  });

  // Chatbot input event
  document.getElementById('user-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  fetchMoodHistory();
  fetchPosts();
});

// Fetching Functions
async function fetchMoodHistory() {
  const { data, error } = await supabase.from('checkins').select().order('created_at', { ascending: false }).limit(20);
  const container = document.getElementById('mood-history');

  if (error) {
    console.error('Mood history error:', error);
    return;
  }

  container.innerHTML = data.length
    ? data.map(entry => `
      <div class="mood-entry">
        <strong>${entry.mood}</strong> — <small>${new Date(entry.created_at).toLocaleString()}</small>
        ${entry.note ? `<p><em>Note:</em> ${entry.note}</p>` : ''}
      </div><hr>`).join('')
    : '<p>No mood entries yet.</p>';
}

async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select().order('created_at', { ascending: false }).limit(20);
  const container = document.getElementById('posts-container');

  if (error) {
    container.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
    return;
  }

  container.innerHTML = data.length
    ? data.map(post => `
      <div class="post-entry">
        <strong>${post.anonymous_id}</strong> <small>${new Date(post.created_at).toLocaleString()}</small>
        <p>${post.content}</p>
      </div>`).join('')
    : '<p>No posts yet. Be the first to share!</p>';
}

// Admin Moderation (Optional for admin dashboard)
async function fetchPendingPosts() {
  const { data } = await supabase.from('posts').select().eq('status', 'pending');
  const list = document.getElementById('moderation-list');
  list.innerHTML = '';
  data.forEach(post => {
    list.innerHTML += `
      <p><strong>${post.anonymous_id}</strong>: ${post.content}</p>
      <button onclick="approvePost('${post.id}')">✅ Approve</button>
      <button onclick="deletePost('${post.id}')">🗑️ Delete</button>
      <hr>`;
  });
}

async function approvePost(id) {
  await supabase.from('posts').update({ status: 'approved' }).eq('id', id);
  fetchPendingPosts();
}

async function deletePost(id) {
  await supabase.from('posts').delete().eq('id', id);
  fetchPendingPosts();
}