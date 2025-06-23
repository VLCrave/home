  // Initialize Lucide icons
  lucide.createIcons();
    
  // Set current year
  $('#current-year').text(new Date().getFullYear());
  
  // Fade in animations
  setTimeout(function() {
    $('#header').addClass('active');
    setTimeout(function() {
      $('#card-container').addClass('active');
    }, 100);
  }, 100);
  
  // Form submission
  $('#validation-form').on('submit', function(e) {
    e.preventDefault();
    
    const gameId = $('#gameId').val();
    const serverId = $('#serverId').val();
    
    if (!gameId || !serverId) {
      showError('Harap Masukkan User ID dan Server ID');
      return;
    }
    
    // Show loading state
    const originalButtonText = $('#submit-button').html();
    $('#submit-button').html('<div class="flex items-center justify-center"><i data-lucide="loader-2" class="mr-2 h-4 w-4 animate-spin"></i><span>Mengecek...</span></div>');
    $('#submit-button').prop('disabled', true);
    lucide.createIcons();
    
    // Hide previous results/errors
    $('#error-container').addClass('hidden');
    $('#result-container').addClass('hidden');
    
    // Make AJAX call to the API
    $.ajax({
      url: '/api/validasi',
      type: 'GET',
      data: {
        id: gameId,
        serverid: serverId
      },
      dataType: 'json',
      success: function(data) {
        if (data.status === 'success') {
          showResult(data.result);
        } else {
          showError(data.message || 'Failed to validate ID');
        }
      },
      error: function(xhr, status, error) {
        let errorMessage = 'Error connecting to server';
        
        try {
          const response = JSON.parse(xhr.responseText);
          if (response && response.message) {
            errorMessage = response.message;
          }
        } catch (e) {
          // If parsing fails, use the default error message
        }
        
        showError(errorMessage);
      },
      complete: function() {
        // Reset button state
        $('#submit-button').html(originalButtonText);
        $('#submit-button').prop('disabled', false);
      }
    });
  });
  
  function showError(message) {
    $('#error-message').text(message);
    $('#error-container').removeClass('hidden');
    
    // Add fade-in effect
    $('#error-container').css('opacity', '0');
    $('#error-container').css('transform', 'translateY(5px)');
    setTimeout(function() {
      $('#error-container').css('opacity', '1');
      $('#error-container').css('transform', 'translateY(0)');
    }, 10);
  }
  
  function showResult(result) {
    $('#result-nickname').text(result.nickname);
    $('#result-country').text(result.country);
    $('#result-container').removeClass('hidden');
    
    // Add fade-in effect
    $('#result-container').css('opacity', '0');
    $('#result-container').css('transform', 'translateY(5px)');
    setTimeout(function() {
      $('#result-container').css('opacity', '1');
      $('#result-container').css('transform', 'translateY(0)');
    }, 10);
  }