// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const studentForm = document.getElementById('studentForm');
    const studentTableBody = document.querySelector('#studentTable tbody');
    const noDataMessage = document.getElementById('noDataMessage');
    const searchInput = document.getElementById('searchInput');
    const submitBtn = document.querySelector('.btn-add');

    // key for LocalStorage
    const STORAGE_KEY = 'srms_data';

    // State for editing
    let isEditing = false;
    let currentEditId = null;

    // Load students from LocalStorage
    let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Helper function to save to LocalStorage
    const saveStudents = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    };

    // Helper function to check if table is empty
    const checkEmptyTable = (dataLength) => {
        if (dataLength === 0) {
            noDataMessage.style.display = 'block';
        } else {
            noDataMessage.style.display = 'none';
        }
    };

    // Function to render the table rows
    const renderTable = (data = students) => {
        // Clear existing rows
        studentTableBody.innerHTML = '';

        data.forEach((student) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.classGrade}</td>
                <td>${student.cgpa || '-'}</td>
                <td>
                    <button class="btn-edit" data-id="${student.id}">Edit</button>
                    <button class="btn-delete" data-id="${student.id}">Delete</button>
                </td>
            `;

            studentTableBody.appendChild(row);
        });

        checkEmptyTable(data.length);
    };

    // Form Submission Handler
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values from inputs
        const name = document.getElementById('name').value;
        const rollNo = document.getElementById('rollNo').value;
        const classGrade = document.getElementById('classGrade').value;
        const cgpa = document.getElementById('cgpa').value;

        if (name && rollNo && classGrade && cgpa) {
            if (isEditing) {
                // Update existing student
                const index = students.findIndex(s => s.id === currentEditId);
                if (index !== -1) {
                    students[index] = { ...students[index], name, rollNo, classGrade, cgpa };

                    // Reset edit state
                    isEditing = false;
                    currentEditId = null;
                    submitBtn.textContent = 'Add Student';
                    submitBtn.style.backgroundColor = '#27ae60'; // Reset color
                }
            } else {
                // Add new student object
                const newStudent = {
                    id: Date.now(), // simple unique ID
                    name,
                    rollNo,
                    classGrade,
                    cgpa
                };
                students.push(newStudent);
            }

            saveStudents();
            renderTable();

            // Clear form
            studentForm.reset();
        }
    });

    // Table Action Buttons Handler (Event Delegation)
    studentTableBody.addEventListener('click', (e) => {
        // Handle Delete
        if (e.target.classList.contains('btn-delete')) {
            const id = parseInt(e.target.getAttribute('data-id'));

            // Confirm deletion
            if (confirm('Are you sure you want to delete this record?')) {
                students = students.filter(student => student.id !== id);
                saveStudents();

                // Refresh table respecting search filter
                const currentSearch = searchInput.value.toLowerCase();
                if (currentSearch) {
                    const filtered = students.filter(student =>
                        student.name.toLowerCase().includes(currentSearch)
                    );
                    renderTable(filtered);
                } else {
                    renderTable();
                }
            }
        }

        // Handle Edit
        if (e.target.classList.contains('btn-edit')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const studentToEdit = students.find(s => s.id === id);

            if (studentToEdit) {
                // Populate form
                document.getElementById('name').value = studentToEdit.name;
                document.getElementById('rollNo').value = studentToEdit.rollNo;
                document.getElementById('classGrade').value = studentToEdit.classGrade;
                document.getElementById('cgpa').value = studentToEdit.cgpa || '';

                // Set edit state
                isEditing = true;
                currentEditId = id;
                submitBtn.textContent = 'Update Student';
                submitBtn.style.backgroundColor = '#f39c12'; // Orange for update

                // Scroll to top to see form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Search Handler
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm)
        );

        renderTable(filteredStudents);
    });

    // Initial render
    renderTable();
});
