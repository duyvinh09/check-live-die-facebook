document.addEventListener('DOMContentLoaded', function() {
    // Check button click handler
    document.getElementById('check-btn').addEventListener('click', checkAccounts);
    
    // Clear button click handler
    document.getElementById('clear-btn').addEventListener('click', function() {
        document.getElementById('fb-ids').value = '';
        document.getElementById('result-count').classList.add('hidden');
        document.getElementById('result-count').textContent = '';
    });
    
    // Also check when pressing Ctrl+Enter in the textarea
    document.getElementById('fb-ids').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            checkAccounts();
        }
    });
    
    // FAQ toggle functionality
    document.querySelectorAll('.faq-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            content.classList.toggle('hidden');
            icon.classList.toggle('transform');
            icon.classList.toggle('rotate-180');
        });
    });
});

async function checkAccounts() {
    document.getElementById('result-count').classList.add('hidden');
    document.getElementById('result-count').textContent = '';
    
    const fbIdsText = document.getElementById('fb-ids').value.trim();
    const resultContainer = document.getElementById('result-container');
    const singleResult = document.getElementById('single-result');
    const singleResultContent = document.getElementById('single-result-content');
    const multipleResults = document.getElementById('multiple-results');
    const multipleResultsContent = document.getElementById('multiple-results-content');
    const initialState = document.getElementById('initial-state');
    const loadingState = document.getElementById('loading-state');
    const resultCount = document.getElementById('result-count');
    
    
    if (!fbIdsText) {
        showError('Vui lòng nhập ít nhất một ID hoặc tên người dùng Facebook');
        return;
    }
    
    // Parse IDs from text (support both comma and newline separated)
    const ids = fbIdsText.split(/[\n,]+/).map(id => id.trim()).filter(id => id.length > 0);
    
    if (ids.length === 0) {
        showError('Không tìm thấy ID hợp lệ trong nội dung nhập');
        return;
    }
    
    // Show loading state
    initialState.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Update progress
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    progressBar.style.width = '0%';
    progressText.textContent = `0/${ids.length} ID đã được kiểm tra`;
    
    // Clear previous results
    singleResultContent.innerHTML = '';
    multipleResultsContent.innerHTML = '';
    
    // Process each ID sequentially
    let activeCount = 0;
    let inactiveCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        
        try {
            // Update progress
            progressBar.style.width = `${((i + 1) / ids.length) * 100}%`;
            progressText.textContent = `${i + 1}/${ids.length} ID đã được kiểm tra`;
            
            // Check account status
            const status = await checkSingleAccount(id);
            
            // For single account, show detailed result
            if (ids.length === 1) {
                if (status === 'active') {
                    activeCount++;
                    singleResultContent.innerHTML = `
                        <div class="text-center">
                            <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
                                <i class="fas fa-check-circle text-5xl text-green-500"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Tài khoản <span class="text-green-600">Còn Hoạt Động</span></h3>
                            <p class="text-gray-600 mb-4">Tài khoản Facebook với ID <span class="font-mono bg-gray-100 px-2 py-1 rounded">${id}</span> hiện đang còn hoạt động.</p>
                            <a href="https://www.facebook.com/${id}" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-external-link-alt mr-2"></i> Xem Trang Cá Nhân
                            </a>
                        </div>
                    `;
                } else if (status === 'inactive') {
                    inactiveCount++;
                    singleResultContent.innerHTML = `
                        <div class="text-center">
                            <div class="inline-block p-4 bg-red-100 rounded-full mb-4">
                                <i class="fas fa-times-circle text-5xl text-red-500"></i>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Tài khoản <span class="text-red-600">Đã Bị Vô Hiệu Hóa</span></h3>
                            <p class="text-gray-600 mb-4">Tài khoản Facebook với ID <span class="font-mono bg-gray-100 px-2 py-1 rounded">${id}</span> có vẻ đã bị vô hiệu hóa hoặc xóa.</p>
                            <div class="bg-red-50 border-l-4 border-red-500 p-4 text-left">
                                <p class="text-sm text-red-700">
                                    <i class="fas fa-exclamation-triangle mr-2"></i> Tài khoản này có thể đã bị Facebook vô hiệu hóa do vi phạm chính sách hoặc bị người dùng xóa.
                                </p>
                            </div>
                        </div>
                    `;
                }
            } 
            // For multiple accounts, show list view
            else {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item p-4 hover:bg-gray-50';
                
                if (status === 'active') {
                    activeCount++;
                    resultItem.innerHTML = `
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <i class="fas fa-check-circle text-green-500"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${id}</div>
                                <div class="text-sm text-green-600">Còn hoạt động</div>
                            </div>
                            <div class="ml-auto">
                                <a href="https://www.facebook.com/${id}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    `;
                } else if (status === 'inactive') {
                    inactiveCount++;
                    resultItem.innerHTML = `
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <i class="fas fa-times-circle text-red-500"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${id}</div>
                                <div class="text-sm text-red-600">Đã vô hiệu hóa</div>
                            </div>
                        </div>
                    `;
                }
                
                multipleResultsContent.appendChild(resultItem);
            }
            
        } catch (error) {
            errorCount++;
            // For single account error
            if (ids.length === 1) {
                singleResultContent.innerHTML = `
                    <div class="flex items-center justify-center py-8 text-red-500">
                        <i class="fas fa-exclamation-circle text-3xl mr-3"></i>
                        <span class="text-gray-700">Lỗi khi kiểm tra tài khoản ${id}: ${error.message}</span>
                    </div>
                `;
            } 
            // For multiple accounts error
            else {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item p-4 hover:bg-gray-50';
                resultItem.innerHTML = `
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${id}</div>
                            <div class="text-sm text-yellow-600">Lỗi khi kiểm tra</div>
                        </div>
                    </div>
                `;
                multipleResultsContent.appendChild(resultItem);
            }
        }
    }
    
    // Hide loading and show results
    loadingState.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    // Show appropriate result view
    if (ids.length === 1) {
        singleResult.classList.remove('hidden');
        multipleResults.classList.add('hidden');
    } else {
        singleResult.classList.add('hidden');
        multipleResults.classList.remove('hidden');
        
        // Update result count
        resultCount.classList.remove('hidden');
        resultCount.textContent = `${activeCount} hoạt động, ${inactiveCount} vô hiệu, ${errorCount} lỗi`;
    }
}

async function checkSingleAccount(fbId) {
    // Construct the Facebook Graph API URL
    const url = `https://graph2.facebook.com/v3.3/${fbId}/picture?redirect=0`;
    
    // Make the API request
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    // Check HTTP status code
    if (response.status === 200) {
        const data = await response.json();
        
        // Check if the account is live or disabled
        if (data.data && data.data.url && data.data.url.startsWith('https://scontent') && data.data.height && data.data.width) {
            return 'active'; // Account is live
        } else if (data.data && data.data.url === 'https://static.xx.fbcdn.net/rsrc.php/v4/yo/r/UlIqmHJn-SK.gif') {
            return 'inactive'; // Account is disabled
        } else {
            throw new Error('Phản hồi từ server không hợp lệ');
        }
    } else {
        throw new Error(`Mã trạng thái HTTP: ${response.status}`);
    }
}

function showError(message) {
    const resultContainer = document.getElementById('result-container');
    const singleResult = document.getElementById('single-result');
    const singleResultContent = document.getElementById('single-result-content');
    const multipleResults = document.getElementById('multiple-results');
    const initialState = document.getElementById('initial-state');
    const loadingState = document.getElementById('loading-state');
    
    initialState.classList.add('hidden');
    loadingState.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    // Show error in single result view
    singleResult.classList.remove('hidden');
    multipleResults.classList.add('hidden');
    
    singleResultContent.innerHTML = `
        <div class="flex items-center justify-center py-8 text-red-500">
            <i class="fas fa-exclamation-circle text-3xl mr-3"></i>
            <span class="text-gray-700">${message}</span>
        </div>
    `;
    singleResultContent.classList.add('fade-in');
}