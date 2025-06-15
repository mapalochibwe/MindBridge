/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://rgiwxrvpvptsaktrwjdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXd4cnZwdnB0c2FrdHJ3amR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjA2MjEsImV4cCI6MjA2NTI5NjYyMX0.-ERmom6oBTMZW9Mx3DtKh8ZdLVl71Wm6HLl-sJXvGLY'; // Use anon/public key, not service role
const supabase = createClient(supabaseUrl, supabaseKey);
document.addEventListener('DOMContentLoaded'), () => {
  // ... any other DOM code
  
  document.addEventListener('DOMContentLoaded', () => {
  fetchMoodHistory();
});
document.getElementById('forum-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('post-content').value.trim();
  if (!content) return;

  const anonymous_id = getAnonymousId();

  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, anonymous_id }]);

  if (error) {
    alert('Error posting: ' + error.message);
    return;
  }

  document.getElementById('post-content').value = '';
  fetchPosts();
});

document.addEventListener('DOMContentLoaded', () => {
  fetchMoodHistory();
  fetchPosts();
});

// After successful insert
document.getElementById('response-message').textContent = 'Mood logged successfully!';
fetchMoodHistory(); // Refresh history after new entry

  // ✅ Insert check-in logic here
  const form = document.getElementById('mood-form');
  const message = document.getElementById('response-message');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const mood = document.getElementById('mood').value;
      const note = document.getElementById('note').value;

      const { data, error } = await supabase
        .from('checkins')
        .insert([{ mood, note }]);

      if (error) {
        console.error('Error:', error);
        message.textContent = '❌ Could not save your check-in. Try again.';
      } else {
        console.log('Check-in saved:', data);
        message.textContent = '✅ Check-in saved!';
        form.reset();
      }
    });
  }
}

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const responseBox = document.getElementById('form-response');

  const { error } = await supabase
    .from('messages')
    .insert([{ name, email, message }]);

  if (error) {
    console.error('Submission error:', error);
    responseBox.textContent = '❌ Something went wrong. Please try again.';
  } else {
    responseBox.textContent = '✅ Message sent successfully!';
    document.getElementById('contact-form').reset();
  }
});

document.getElementById('rsvp-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('rsvp-name').value;
  const email = document.getElementById('rsvp-email').value;
  const event = document.getElementById('event-name').value;

  const { error } = await supabase
    .from('rsvps')
    .insert([{ name, email, event }]);

  const response = document.getElementById('rsvp-response');
  if (error) {
    console.error('RSVP Error:', error);
    response.textContent = '❌ Failed to RSVP. Try again.';
  } else {
    response.textContent = '✅ You are now registered!';
    document.getElementById('rsvp-form').reset();
  }
});

document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;

  const { error } = await supabase.auth.signInWithOtp({ email });
  const msg = document.getElementById('auth-message');

  if (error) {
    msg.textContent = "❌ Login failed.";
    console.error(error);
  } else {
    msg.textContent = "✅ Check your email for the login link.";
  }
});

  // ... any other code that runs after DOM is loaded

  async function fetchMoodHistory() {
  const { data, error } = await supabase
    .from('checkins')
    .select('id, mood, note, created_at')
    .order('created_at', { ascending: false })
    .limit(20); // last 20 entries

  if (error) {
    console.error('Error fetching mood history:', error);
    return;
  }

  const container = document.getElementById('mood-history');
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p>No mood entries yet.</p>';
    return;
  }

  data.forEach(entry => {
    const date = new Date(entry.created_at).toLocaleString();
    const note = entry.note ? `<p><em>Note:</em> ${entry.note}</p>` : '';
    container.innerHTML += `
      <div class="mood-entry">
        <strong>${entry.mood}</strong> — <small>${date}</small>
        ${note}
      </div>
      <hr>
    `;
  });
  
$(function() {
  $('.work-item a.image').poptrox({
    usePopupCaption: true,
    usePopupCloser: true,
    overlayColor: '#000',
    overlayOpacity: 0.75
  });
});

  async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content, anonymous_id, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  const container = document.getElementById('posts-container');
  if (error) {
    container.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
    return;
  }

  if (data.length === 0) {
    container.innerHTML = '<p>No posts yet. Be the first to share!</p>';
    return;
  }

  container.innerHTML = data.map(post => {
    const date = new Date(post.created_at).toLocaleString();
    return `
      <div class="post-entry">
        <strong>${post.anonymous_id}</strong> <small>${date}</small>
        <p>${post.content}</p>
      </div>
    `;
  }).join('');
}
async function fetchPendingPosts() {
  const { data } = await supabase.from('posts').select('*').eq('status', 'pending');

  const list = document.getElementById('moderation-list');
  list.innerHTML = '';
  data.forEach(post => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>${post.anonymous_id}</strong>: ${post.content}</p>
      <button onclick="approvePost('${post.id}')">✅ Approve</button>
      <button onclick="deletePost('${post.id}')">🗑️ Delete</button>
      <hr>`;
    list.appendChild(div);
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

}
function getAnonymousId() {
  let id = localStorage.getItem('anonymousId');
  if (!id) {
    id = 'User' + Math.floor(Math.random() * 10000);
    localStorage.setItem('anonymousId', id);
  }
  return id;
}


(function($) {
       
	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		settings = {

			// Parallax background effect?
				parallax: true,

			// Parallax factor (lower = more intense, higher = less intense).
				parallaxFactor: 20

		};

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1800px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '481px',   '736px'  ],
			xsmall:  [ null,      '480px'  ],
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Touch?
		if (browser.mobile) {

			// Turn on touch mode.
				$body.addClass('is-touch');

			// Height fix (mostly for iOS).
				window.setTimeout(function() {
					$window.scrollTop($window.scrollTop() + 1);
				}, 0);

		}

	// Footer.
		breakpoints.on('<=medium', function() {
			$footer.insertAfter($main);
		});

		breakpoints.on('>medium', function() {
			$footer.appendTo($header);
		});

	// Header.

		// Parallax background.

			// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
				if (browser.name == 'ie'
				||	browser.mobile)
					settings.parallax = false;

			if (settings.parallax) {

				breakpoints.on('<=medium', function() {

					$window.off('scroll.strata_parallax');
					$header.css('background-position', '');

				});

				breakpoints.on('>medium', function() {

					$header.css('background-position', 'left 0px');

					$window.on('scroll.strata_parallax', function() {
						$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
					});

				});

				$window.on('load', function() {
					$window.triggerHandler('scroll');
				});

			}

	// Main Sections: Two.

		// Lightbox gallery.
			$window.on('load', function() {

				$('#two').poptrox({
					caption: function($a) { return $a.next('h3').text(); },
					overlayColor: '#2c2c2c',
					overlayOpacity: 0.85,
					popupCloserText: '',
					popupLoaderText: '',
					selector: '.work-item a.image',
					usePopupCaption: true,
					usePopupDefaultStyling: false,
					usePopupEasyClose: false,
					usePopupNav: true,
					windowMargin: (breakpoints.active('<=small') ? 0 : 50)
				});

			});

})(jQuery);