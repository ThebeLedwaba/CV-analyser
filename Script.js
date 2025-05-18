function displayResults(results) {
    // Show results section
    document.getElementById('result').style.display = 'block';
    
    // Display overall score
    document.getElementById('score').textContent = results.matchScore;
    document.getElementById('score-fill').style.width = `${results.matchScore}%`;
    
    // Display matched and missing counts
    const totalMatched = Object.values(results.matches).reduce(
      (sum, category) => sum + category.matched.length, 0
    );
    const totalMissing = Object.values(results.matches).reduce(
      (sum, category) => sum + category.missing.length, 0
    );
    
    document.getElementById('matched-count').textContent = totalMatched;
    document.getElementById('missing-count').textContent = totalMissing;
    
    // Display matched keywords
    const matchedKeywords = [];
    Object.values(results.matches).forEach(category => {
      category.matched.forEach(match => {
        matchedKeywords.push(match.keyword);
      });
    });
    
    displayKeywordCloud('matched', matchedKeywords);
    
    // Display missing keywords
    const missingKeywords = [];
    Object.values(results.matches).forEach(category => {
      missingKeywords.push(...category.missing);
    });
    
    displayKeywordCloud('missing', missingKeywords);
    
    // Display suggestions
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (results.suggestions.length === 0) {
      suggestionsContainer.innerHTML = '<p>Your resume matches the job description well! No major suggestions.</p>';
    } else {
      results.suggestions.forEach(suggestion => {
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'suggestion';
        suggestionEl.innerHTML = `
          <h4><i class="fas fa-lightbulb"></i> ${suggestion.category}</h4>
          <p>${suggestion.message}</p>
        `;
        suggestionsContainer.appendChild(suggestionEl);
      });
    }
    
    // Display detailed analysis
    updateMeter('skills-meter', calculateCategoryScore('skills', results));
    updateMeter('exp-meter', calculateCategoryScore('experience', results));
    updateMeter('edu-meter', calculateCategoryScore('education', results));
    updateMeter('density-meter', calculateKeywordDensityScore(results));
    
    document.getElementById('skills-analysis').textContent = getCategoryAnalysis('skills', results);
    document.getElementById('exp-analysis').textContent = getCategoryAnalysis('experience', results);
    document.getElementById('edu-analysis').textContent = getCategoryAnalysis('education', results);
    document.getElementById('density-analysis').textContent = getDensityAnalysis(results);
  }
  
  // Helper functions needed by displayResults
  function displayKeywordCloud(containerId, keywords) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Count keyword frequency for sizing
    const keywordCounts = {};
    keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    // Create keyword elements
    Object.entries(keywordCounts).forEach(([keyword, count]) => {
      const span = document.createElement('span');
      span.textContent = keyword;
      
      // Size based on frequency
      const size = Math.min(20, 12 + count * 2);
      span.style.fontSize = `${size}px`;
      
      container.appendChild(span);
    });
  }
  
  function calculateCategoryScore(category, results) {
    const matched = results.matches[category].matched.length;
    const total = Object.keys(results.jobKeywords[category]).length;
    return total > 0 ? Math.round((matched / total) * 100) : 0;
  }
  
  function calculateKeywordDensityScore(results) {
    let totalRatio = 0;
    let count = 0;
    
    Object.values(results.matches).forEach(category => {
      category.matched.forEach(match => {
        if (match.resumeCount && match.jobCount) {
          totalRatio += Math.min(1, match.resumeCount / match.jobCount);
          count++;
        }
      });
    });
    
    return count > 0 ? Math.round((totalRatio / count) * 100) : 0;
  }
  
  function updateMeter(meterId, percent) {
    const meter = document.getElementById(meterId);
    meter.style.width = `${percent}%`;
    
    // Change color based on percentage
    if (percent < 30) {
      meter.style.backgroundColor = '#f72585'; // danger
    } else if (percent < 70) {
      meter.style.backgroundColor = '#f8961e'; // warning
    } else {
      meter.style.backgroundColor = '#4cc9f0'; // success
    }
  }
  
  function getCategoryAnalysis(category, results) {
    const score = calculateCategoryScore(category, results);
    const matched = results.matches[category].matched.length;
    const total = Object.keys(results.jobKeywords[category]).length;
    
    if (total === 0) return 'No relevant keywords in this category.';
    
    if (score >= 80) {
      return `Excellent match! You have ${matched} of ${total} ${category} keywords.`;
    } else if (score >= 50) {
      return `Good match. You have ${matched} of ${total} ${category} keywords.`;
    } else if (score > 0) {
      return `Low match. You have only ${matched} of ${total} ${category} keywords.`;
    } else {
      return `No ${category} keywords matched. Consider adding relevant ${category}.`;
    }
  }
  
  function getDensityAnalysis(results) {
    const score = calculateKeywordDensityScore(results);
    
    if (score >= 80) {
      return 'Excellent keyword density. Your resume uses important keywords frequently enough.';
    } else if (score >= 50) {
      return 'Good keyword density. Some keywords could be used more frequently.';
    } else if (score > 0) {
      return 'Low keyword density. Important keywords are under-represented in your resume.';
    } else {
      return 'No matching keywords found for density analysis.';
    }
  }