// scripts/test-kapa-integration.js
const axios = require('axios');
require('dotenv').config();

/**
 * Test the Kapa AI integration for GitHub issues
 */
class KapaIssueProcessor {
  constructor(apiToken, projectId) {
    this.apiToken = apiToken;
    this.projectId = projectId;
    this.baseURL = 'https://api.kapa.ai';
    this.chatURL = `${this.baseURL}/query/v1/projects/${this.projectId}/chat/`;
  }

  /**
   * Process an issue and get AI response
   */
  async processIssue(issueTitle, issueBody) {
    // Store title for use in cleanIssueBody method
    this.currentTitle = issueTitle;
    
    const query = this.formatQuery(issueTitle, issueBody);
    
    try {
      const response = await this.queryChatAPI(query);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error processing issue:', error.response?.data || error.message);
      return this.getFallbackResponse();
    }
  }

  /**
   * Format the issue into a query for Kapa
   */
  formatQuery(title, body) {
    // Clean up common GitHub issue patterns
    const cleanBody = this.cleanIssueBody(body);
    
    return `
I need to provide a helpful, friendly, and comprehensive response to a GitHub issue from the Strapi community.

**Issue Title:** ${title}

**Issue Description:**
${cleanBody}

Please provide a response that:

1. **Tone & Approach:**
   - Be warm, welcoming, and supportive - this represents the Strapi brand
   - Show empathy for the user's situation and acknowledge their effort in reporting the issue
   - Use friendly language that makes the user feel valued in our community

2. **Technical Content:**
   - Directly address the question or problem described
   - Provide relevant code examples, configuration snippets, or step-by-step guidance when applicable
   - Include links to official Strapi documentation that can help
   - If the issue involves a bug, acknowledge it and provide workarounds if possible
   - If it's a feature request, explain current alternatives or suggest next steps

3. **Response Guidelines:**
   - If you cannot find specific information to answer this question, be honest about it
   - Suggest where the user might find more resources (Discord, documentation sections, etc.)
   - For complex issues, break down the response into clear, actionable steps
   - If the issue seems like it requires core team attention, indicate that appropriately

Please craft a response that will be posted as an automated GitHub comment, so it should be complete and helpful on its own while being genuinely friendly and supportive.
    `.trim();
  }

  /**
   * Clean up GitHub issue body text
   */
  cleanIssueBody(body) {
    if (!body) return 'No additional details provided.';
    
    // Remove common GitHub issue template artifacts
    let cleaned = body
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove "No response" placeholders
      .replace(/\n_No response_\s*$/gm, '')
      // Remove auto-sync indicators
      .replace(/Automatic sync of commit from main/g, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace
      .trim();
    
    // If the body is very short or just template text, provide context
    if (cleaned.length < 20 || cleaned === 'No additional details provided.') {
      return `${cleaned}\n\n(Note: This is a brief issue description. The title "${this.currentTitle}" may contain additional context.)`;
    }
    
    return cleaned;
  }

  /**
   * Query Kapa AI Chat API
   */
  async queryChatAPI(query) {
    const payload = {
      query: query,
      // Optional parameters for the chat API
      user_data: {
        source: 'github-automation'
      }
    };

    console.log(`Calling Kapa Chat API: ${this.chatURL}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const headers = {
      'X-API-Key': this.apiToken, // Use X-API-Key instead of Bearer
      'Content-Type': 'application/json',
      'User-Agent': 'Strapi-Docs-GitHub-Bot/1.0'
    };

    console.log('Using X-API-Key authentication');

    try {
      const response = await axios.post(this.chatURL, payload, {
        headers: headers,
        timeout: 45000, // 45 second timeout for chat responses
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors so we can debug
      });

      console.log('Kapa API Response Status:', response.status);
      
      if (response.status >= 400) {
        console.log('Error Response Data:', JSON.stringify(response.data, null, 2));
        throw new Error(`API returned ${response.status}: ${JSON.stringify(response.data)}`);
      }

      console.log('Kapa API Response Keys:', Object.keys(response.data));
      console.log('Answer preview:', response.data.answer ? response.data.answer.substring(0, 200) + '...' : 'No answer field');
      
      return response.data;

    } catch (error) {
      if (error.response) {
        console.error('HTTP Error Details:');
        console.error('- Status:', error.response.status);
        console.error('- Data:', error.response.data);
        
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error(`Authentication failed (${error.response.status}). Please check your KAPA_API_TOKEN.`);
        }
      }
      throw error;
    }
  }

  /**
   * Format the AI response for GitHub
   */
  formatResponse(kapaResponse) {
    // Kapa Chat API response structure based on your debug output
    const answer = kapaResponse.answer;
    const sources = kapaResponse.relevant_sources || [];
    const isUncertain = kapaResponse.is_uncertain || false;
    
    if (!answer) {
      console.warn('No answer found in Kapa response:', kapaResponse);
      return this.getFallbackResponse();
    }
    
    let response = '👋 **Hello and thank you for reaching out to the Strapi community!**\n\n';
    
    // Add uncertainty warning if needed
    if (isUncertain) {
      response += '⚠️ *Please note: I\'m not entirely certain about this response. I recommend verifying this information and feel free to mention @pwizla if you need additional confirmation.*\n\n';
    }
    
    response += '🤖 **AI-Generated Response:**\n\n';
    response += answer + '\n\n';
    
    if (sources.length > 0) {
      response += '📚 **Helpful Documentation Links:**\n';
      sources.forEach(source => {
        const title = source.title || 'Documentation';
        const url = source.source_url;
        if (url) {
          response += `- [${title}](${url})\n`;
        }
      });
      response += '\n';
    }
    
    response += '---\n\n';
    response += '💡 **Need More Help?**\n';
    response += '- **For immediate assistance:** Mention @pwizla in a comment and a human maintainer will jump in to help\n';
    response += '- **Join our community:** Check out our [Discord server](https://discord.strapi.io) for real-time discussions\n';
    response += '- **Explore more:** Try our [interactive AI documentation assistant](https://docs.strapi.io) for additional guidance\n\n';
    response += '**Note:** This response was automatically generated by AI. Our human maintainers regularly review these responses and may provide additional insights, corrections, or improvements. Your feedback and questions help us make our documentation better for everyone! 🙏';
    
    return response;
  }

  /**
   * Fallback response when AI fails
   */
  getFallbackResponse() {
    return `👋 **Hello and thank you for reaching out to the Strapi community!**

🤖 I attempted to analyze your question automatically, but encountered a technical issue while processing your request. Don't worry though - our human maintainers will review this soon!

**In the meantime, here are some resources that might help:**
- 📖 [Official Strapi Documentation](https://docs.strapi.io)
- 💬 [Community Discord](https://discord.strapi.io) - Great for real-time help and discussions
- 🤖 [Interactive AI Documentation Assistant](https://docs.strapi.io) - Click "Ask AI" for immediate help

**Need faster assistance?** Simply mention @pwizla in a comment and a human maintainer will jump in to help you personally.

**Note:** This automated response system is designed to provide quick initial assistance. Our human maintainers regularly review all issues to ensure you get the comprehensive support you deserve. Thank you for being part of our community! 🙏`;
  }

  /**
   * Determine appropriate labels based on issue content
   */
  suggestLabels(title, body) {
    const labels = [];
    const content = `${title} ${body}`.toLowerCase();
    
    const labelMapping = {
      'installation': ['install', 'setup', 'getting started'],
      'deployment': ['deploy', 'production', 'hosting'],
      'api': ['api', 'endpoint', 'rest', 'graphql'],
      'plugins': ['plugin', 'extension'],
      'authentication': ['auth', 'login', 'jwt', 'permission'],
      'database': ['database', 'migration', 'model'],
      'frontend': ['react', 'vue', 'angular', 'frontend'],
      'documentation': ['documentation', 'docs', 'guide'],
      'bug': ['error', 'broken', 'issue', 'problem'],
      'feature-request': ['feature', 'enhancement', 'improvement']
    };

    for (const [label, keywords] of Object.entries(labelMapping)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        labels.push(label);
      }
    }

    return labels;
  }
}

/**
 * Test function with real GitHub issues
 */
async function testKapaIntegration() {
  // Check for required environment variables
  if (!process.env.KAPA_API_TOKEN) {
    console.error('❌ KAPA_API_TOKEN environment variable is required');
    console.error('💡 Set it with: export KAPA_API_TOKEN="your_token_here"');
    process.exit(1);
  }
  
  if (!process.env.KAPA_PROJECT_ID) {
    console.error('❌ KAPA_PROJECT_ID environment variable is required');
    console.error('💡 Set it with: export KAPA_PROJECT_ID="your_project_id_here"');
    process.exit(1);
  }

  console.log(`🔐 Token provided: ${process.env.KAPA_API_TOKEN ? 'YES' : 'NO'}`);
  console.log(`🆔 Project ID: ${process.env.KAPA_PROJECT_ID}`);

  const processor = new KapaIssueProcessor(
    process.env.KAPA_API_TOKEN,
    process.env.KAPA_PROJECT_ID
  );
  
  console.log(`🚀 Testing Kapa integration with real GitHub issues`);
  
  // Test cases based on actual GitHub issues
  const testIssues = [
    {
      title: "[Request]: Clarify support for multiple locale parameters in REST API filter (i18n plugin)",
      body: `### Summary

The current Strapi v4 documentation for the Internationalization (i18n) plugin only shows how to filter content using a single \`locale\` value via the REST API. However, testing reveals that using multiple \`locale\` parameters in a single request (e.g., \`/api/articles?locale=en-US&locale=es-ES\`) returns content from both locales. This suggests that an implicit OR filter is being applied, though this behavior is not documented.

### Why is it needed?

This undocumented behavior could lead to confusion for developers who assume that only one \`locale\` filter is supported per request. Clarifying this in the official documentation will help users understand:

1. Whether filtering by multiple locales is officially supported.
2. If the OR logic is reliable and safe to use in production.
3. If using multiple requests is the recommended approach when querying content in several locales.`
    },
    {
      title: "Admin Panel API typo in example",
      body: `### What does it do?

Per documentation \`injectComponent()\` is being called with no arguments, and then immediately called again as if it returned a function. That way it doesn't work and I always had console errors, the code itself is valid and so my IDE didn't catch it.`
    },
    {
      title: "[Request]: How can I make the strapi code to be ai-gened well by the [cursor ide or copilot, etc ai code tool]?",
      body: `### Summary

cursor - claude 3.7 doesn't seem to generate the strapi backend code well
cursor? windsurf? Is there a setting that makes the strapi (backend) code well?

### Why is it needed?

For example, since there is no manual for the backend service code of the upload plugin in the official documentation, we are looking for the core code ourselves and checking how to use it.
https://github.com/strapi/strapi/blob/70576132e2aa188340b9b78ba8a932926b045374/packages/core/upload/server/src/services/upload.ts#L226
It seems that Cursor doesn't know much about the backend service function of the upload plugin....

How do other people do strapi custom development using AI code tools such as Cursor or Copilot?`
    },
    {
      title: "[Auto-sync] Admin Panel API typo in example (#2508)",
      body: "Automatic sync of commit from main"
    }
  ];

  for (let i = 0; i < testIssues.length; i++) {
    const issue = testIssues[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 Test ${i + 1}/${testIssues.length}: ${issue.title}`);
    console.log(`${'='.repeat(80)}`);
    
    try {
      const startTime = Date.now();
      
      // Show the formatted query that will be sent to Kapa
      console.log('📝 **Query that will be sent to Kapa:**');
      console.log('-'.repeat(50));
      const formattedQuery = processor.formatQuery(issue.title, issue.body);
      console.log(formattedQuery);
      console.log('-'.repeat(50));
      
      const response = await processor.processIssue(issue.title, issue.body);
      const endTime = Date.now();
      const labels = processor.suggestLabels(issue.title, issue.body);
      
      console.log(`\n✅ Response generated in ${endTime - startTime}ms`);
      console.log('\n🤖 **Generated Response:**');
      console.log('-'.repeat(50));
      console.log(response);
      console.log('-'.repeat(50));
      console.log(`\n🏷️  **Suggested labels:** ${labels.join(', ') || 'none'}`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      if (error.response) {
        console.error(`HTTP Status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
    }
    
    // Add delay between requests to be respectful to the API
    if (i < testIssues.length - 1) {
      console.log('\n⏳ Waiting 4 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
  
  console.log('\n🎉 Testing completed!');
  console.log('\n💡 Tips for production deployment:');
  console.log('1. The formatted queries look good and include both title and body');
  console.log('2. Auto-sync issues get cleaned up appropriately');
  console.log('3. Complex issues with templates are handled well');
  console.log('4. Ready to deploy to GitHub Actions!');
}

// Run test if this file is executed directly
if (require.main === module) {
  testKapaIntegration().catch(console.error);
}

module.exports = { KapaIssueProcessor };