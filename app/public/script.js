const form = document.getElementById('studentForm');
const formMessage = document.getElementById('formMessage');
const studentsTable = document.getElementById('studentsTable');
const refreshBtn = document.getElementById('refreshBtn');

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;
  formMessage.hidden = false;
}

async function loadStudents() {
  try {
    const response = await fetch('/students');
    const students = await response.json();

    if (!response.ok) {
      throw new Error(students.error || 'Failed to load students');
    }

    if (students.length === 0) {
      studentsTable.innerHTML = '<p class="empty-state">No students registered yet.</p>';
      return;
    }

    const rows = students
      .map(
        (s) => `
      <tr>
        <td>${s.id}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${new Date(s.created_at).toLocaleString()}</td>
      </tr>`
      )
      .join('');

    studentsTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (err) {
    studentsTable.innerHTML = `<p class="empty-state error">Error: ${err.message}</p>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMessage.hidden = true;

  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    department: document.getElementById('department').value,
  };

  try {
    const response = await fetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    showMessage(data.message, 'success');
    form.reset();
    await loadStudents();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

refreshBtn.addEventListener('click', loadStudents);
loadStudents();
