



window.onload = checkPremiumStatus;




async function checkPremiumStatus() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://13.239.36.38:3000/premium', {
            headers: { 'Authorization': token }
        });

        const isPremium = response.data.isPremium;
        console.log(response);
        if (isPremium) {
            document.getElementById('buyPremiumBtn').style.display = 'none';
            premiumMessage.textContent = 'You are a premium user!';
            premiumMessage.classList.add('premium-message');
            document.getElementById('showLeaderboardBtn').style.display = 'block';
            document.getElementById('downloadExpensesBtn').style.display = 'block';

        }

    } catch (error) {
        console.error(error);
    }
}





var editingItem = null;
document.addEventListener('submit', addExpense);

function addExpense(event) {
    event.preventDefault();
    const ExpenseAmount = event.target.ExpenseAmount.value;
    const Description = event.target.Description.value;
    const Category = event.target.Category.value;
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token not found');
        return;
    }



    const obj = {
        ExpenseAmount,
        Description,
        Category
    };

    if (editingItem === null) {
        axios.post("http://13.239.36.38:3000/user/expense", obj, {
            headers: {
                'Authorization': token // Include the token in the 'Authorization' header
            }
        })
            .then((res) => {
                // showExpenseOnScreen(res.data.newExpense);
                fetchExpenses();
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        axios.put(`http://13.239.36.38:3000/user/expense/${editingItem}`, obj, {
            headers: {
                'Authorization': token // Include the token in the 'Authorization' header
            }
        })
            .then((response) => {
                console.log(response.data);
                // showExpenseOnScreen(response.data.updatedExpense[1][0]);
                fetchExpenses();
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
        editingItem = null;
    }


    event.target.reset();
}

function showExpenseOnScreen(obj) {
    console.log(obj);
    const parentElem = document.getElementById('items');
    const childElem = document.createElement('li');
    childElem.id = `${obj.id}`;
    childElem.textContent = obj.ExpenseAmount + '-' + obj.Description + '-' + obj.Category;

    let deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm float-right m-1';
    deleteBtn.appendChild(document.createTextNode('Delete'));
    deleteBtn.onclick = () => {
        const token = localStorage.getItem('token');
        axios.delete(`http://13.239.36.38:3000/user/expense/${obj.id}`, {
            headers: {
                'Authorization': token // Include the token in the 'Authorization' header
            }
        })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
        parentElem.removeChild(childElem);
    };

    let editBtn = document.createElement('button');
    editBtn.className = 'btn btn-success btn-sm float-right mr-1';
    editBtn.appendChild(document.createTextNode('Edit'));
    editBtn.onclick = function () {
        if (editingItem === null) {

            editingItem = obj.id;


            document.getElementById('ExpenseAmount').value = obj.ExpenseAmount;
            document.getElementById('Description').value = obj.Description;
            document.getElementById('Category').value = obj.Category;
        }
    };

    childElem.appendChild(editBtn);
    childElem.appendChild(deleteBtn);
    parentElem.appendChild(childElem);
}

document.getElementById('buyPremiumBtn').onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://13.239.36.38:3000/purchase/premiummembership', { headers: { 'Authorization': token } });
    console.log(response);
    var option = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            await axios.post('http://13.239.36.38:3000/purchase/premiummembership', {
                order_id: option.order_id,
                payment_id: response.razorpay_payment_id,
                status: response.razorpay_status // Include the payment status received from Razorpay
            }, { headers: { "Authorization": token } });
            checkPremiumStatus();
            alert('you are a premium user now!!!')
        }
    };

    const rzp1 = new Razorpay(option); // Change options to option
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", function (response) {
        console.log(response);
        alert('something went wrong')
    });
};


// Function to fetch and display the leaderboard
async function showLeaderboard() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.239.36.38:3000/premium/leaderboard', {
            headers: { 'Authorization': token }
        });
        const leaderboardData = response.data;

        // Clear previous leaderboard content
        document.getElementById('leaderboardContainer').innerHTML = '';

        // Create a table to display the leaderboard
        const table = document.createElement('table');
        table.classList.add('table');

        // Create table header
        const headerRow = table.createTHead().insertRow();
        headerRow.innerHTML = '<th>User</th><th>Total Expense</th>';

        // Create table body
        const tbody = table.createTBody();
        leaderboardData.forEach(userData => {
            const row = tbody.insertRow();
            if (userData.totalExpense === null) {
                userData.totalExpense = 0;
            }
            row.innerHTML = `<td>${userData.name}</td><td>${userData.totalExpense}</td>`;
        });

        // Append the table to the leaderboard container
        document.getElementById('leaderboardContainer').appendChild(table);
    } catch (error) {
        console.error(error);
        // Show error message if there's an error fetching the leaderboard
        document.getElementById('leaderboardContainer').textContent = 'Error fetching leaderboard data';
    }
}


document.getElementById('showLeaderboardBtn').addEventListener('click', showLeaderboard);

document.getElementById('downloadExpensesBtn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get('http://13.239.36.38:3000/user/expense/download', {
            headers: { 'Authorization': token },

        });


        if (response.status === 200) {

            const link = document.createElement('a');
            link.href = response.data.fileURL;
            link.download = 'myexpenses.csv'

            link.click();
            fetchDownloadedFiles();
        }
        else {
            console.log('could not find the URL');
        }


    } catch (error) {
        console.error('Error downloading expenses:', error);
        // Handle error
    }
});


async function fetchDownloadedFiles() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://13.239.36.38:3000/user/expense/downloaded-files', {
            headers: { 'Authorization': token }
        });
        document.getElementById('downloadedFilesTable').style.display = 'block';

        const downloadedFilesTable = document.getElementById('downloadedFilesTable').getElementsByTagName('tbody')[0];
        downloadedFilesTable.innerHTML = ''; // Clear previous content

        response.data.forEach(file => {
            const row = downloadedFilesTable.insertRow();
            const dateCell = row.insertCell(0);
            const timeCell = row.insertCell(1);
            const downloadLinkCell = row.insertCell(2);

            // Parse date and time from ISO format
            const dateTime = new Date(file.createdAt);
            const date = dateTime.toLocaleDateString();
            const time = dateTime.toLocaleTimeString();

            dateCell.textContent = date;
            timeCell.textContent = time;

            // Add a space between date and time
            const separator = document.createTextNode(' ');
            timeCell.appendChild(separator);

            const link = document.createElement('a');
            link.textContent = 'Download';
            link.href = file.fileURL;
            // link.download = file.filename;
            downloadLinkCell.appendChild(link);
        });
    } catch (error) {
        console.error('Error fetching downloaded files:', error);
        // Handle error
    }
}



// async function fetchExpenses() {
//     document.getElementById('items').innerHTML = '';
//     const token = localStorage.getItem('token');
//     try {
//         const response = await axios.get("http://13.239.36.38:3000/user/expense", {
//             headers: {
//                 'Authorization': token // Include the JWT token in the 'Authorization' header
//             }
//         });
//         for (let i = 0; i < response.data.length; i++) {
//             showExpenseOnScreen(response.data[i]);
//         }
//         console.log(response);
//     } catch (error) {
//         console.log(error);
//     }
// }
// fetchExpenses();

function handleExpensesPerPageChange() {

    const selectedExpensesPerPage = document.getElementById('expensesPerPage').value;

    localStorage.setItem('expensesPerPage', selectedExpensesPerPage);

    fetchExpenses();
}





async function fetchExpenses(page = 1, limit = localStorage.getItem('expensesPerPage')) {
    document.getElementById('items').innerHTML = '';
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`http://13.239.36.38:3000/user/expense`, {
            headers: {
                'Authorization': token
            },
            params: {
                page: page,
                limit: limit
            }
        });

        const expenses = response.data.expenses;

        expenses.forEach(expense => {
            showExpenseOnScreen(expense);
        });

        const totalPages = response.data.totalPages;
        const hasNextPage = response.data.hasNextPage;
        const hasPreviousPage = response.data.hasPreviousPage;


        renderPaginationButtons(page, totalPages, hasNextPage, hasPreviousPage);

        console.log(response);
    } catch (error) {
        console.log(error);
    }
}

function renderPaginationButtons(currentPage, totalPages, hasNextPage, hasPreviousPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (hasPreviousPage) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.addEventListener('click', () => fetchExpenses(currentPage - 1));
        prevButton.classList.add('pagination-btn');
        paginationContainer.appendChild(prevButton);
    }

    if (hasNextPage) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.addEventListener('click', () => fetchExpenses(currentPage + 1));
        nextButton.classList.add('pagination-btn');
        paginationContainer.appendChild(nextButton);
    }
}


fetchExpenses();