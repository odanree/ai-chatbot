/**
 * PortfolioStrategy
 * Chatbot behavior for Danh Le's portfolio website
 * Showcases experience, skills, projects, and provides contact information
 */

import { BaseBehaviorStrategy } from '../base/BaseBehaviorStrategy.js';
import { StrategyType, KnowledgeBase } from '../../types/strategy.types.js';

export class PortfolioStrategy extends BaseBehaviorStrategy {
  private knowledgeBase: KnowledgeBase;

  constructor() {
    super(
      true, // enabled
      '1.0.0', // version
      'professional', // tone
      150 // maxResponseLength
    );

    this.knowledgeBase = {
      owner: 'Danh Le',
      role: 'Software Engineer 2',
      company: 'Ultra Mobile (T-Mobile - Mint Mobile)',
      location: 'Costa Mesa, CA',
      yearsExperience: '8+ years',
      
      skills: [
        // Frontend
        'React', 'Next.js', 'TypeScript', 'JavaScript (ES6+)',
        'HTML5', 'CSS3', 'SASS/SCSS', 'Bootstrap',
        'jQuery', 'Responsive Web Design',
        
        // Backend
        'Node.js', 'Express.js', 'PHP', 'WordPress', 'WooCommerce',
        'REST APIs', 'GraphQL',
        
        // E-commerce & CMS
        'Shopify', 'WooCommerce', 'WordPress', 'Magento',
        
        // Tools & Platforms
        'Git', 'GitHub', 'VS Code', 'Figma',
        'AWS (S3, CloudFront)', 'Vercel', 'cPanel',
        
        // Testing & QA
        'Cypress', 'Jest', 'Vitest', 'Cross-browser Testing',
        
        // Other
        'SEO', 'Google Analytics', 'Tag Manager', 'A/B Testing',
        'Agile/Scrum', 'CI/CD'
      ],
      
      projects: [
        {
          name: 'AI Chatbot Widget',
          description: 'Embeddable AI-powered chatbot with customizable behavior strategies for different use cases (portfolio, ecommerce, support). Features OpenAI integration, CORS security, and dynamic greeting system.',
          technologies: ['TypeScript', 'Express.js', 'OpenAI API', 'Node.js', 'Vercel', 'Strategy Pattern'],
          link: 'https://ai-chatbot-lake-eight-99.vercel.app'
        },
        {
          name: 'Shopify Headless Ecommerce',
          description: 'Modern headless commerce platform with Next.js and Shopify Storefront API. Features custom cart, product browsing, variant selection, and Cypress E2E testing.',
          technologies: ['Next.js', 'TypeScript', 'Shopify Storefront API', 'CSS Modules', 'Cypress'],
          link: undefined
        },
        {
          name: 'Portfolio Website',
          description: 'Personal portfolio website showcasing full-stack development skills. Hosted on AWS S3 with CloudFront CDN, featuring integrated AI chatbot assistant.',
          technologies: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'AWS S3', 'CloudFront'],
          link: 'https://danhle.net'
        },
        {
          name: 'ADU Cost Calculator',
          description: 'Intelligent Accessory Dwelling Unit (ADU) builder and cost estimation tool for California homeowners. Built with Next.js and TypeScript.',
          technologies: ['Next.js', 'TypeScript', 'React', 'CSS Modules', 'Vercel'],
          link: undefined
        }
      ],
      
      contact: {
        email: 'webmaster@danhle.net',
        location: 'Costa Mesa, CA',
        phone: undefined // Not publicly shared
      },
      
      links: {
        github: 'https://github.com/dtle82',
        linkedin: 'https://www.linkedin.com/in/dtle82',
        website: 'https://danhle.net',
        twitter: undefined
      },
      
      highlights: [
        '8+ years of full-stack development experience',
        'Expert in React, TypeScript, Next.js, and modern JavaScript frameworks',
        'Built production-ready e-commerce platforms with Shopify and WooCommerce',
        'Developed AI-powered chatbot with customizable Strategy Pattern architecture',
        'Strong background in headless e-commerce and REST API integration',
        'Proven expertise in AWS deployment, performance optimization, and CI/CD'
      ],
      
      currentFocus: [
        'Full-stack TypeScript development (React, Next.js, Node.js)',
        'Headless e-commerce architectures',
        'AI-powered customer experience tools',
        'Performance optimization and Core Web Vitals'
      ]
    };
  }

  getType(): StrategyType {
    return 'portfolio';
  }

  getSystemPrompt(): string {
    const basePrompt = `You are Danh Le's AI assistant on his portfolio website at danhle.net.

ABOUT DANH LE:
- Software Engineer 2 at Ultra Mobile (T-Mobile - Mint Mobile brand)
- 8+ years of full-stack development experience
- Location: Costa Mesa, California
- Expert in React, TypeScript, Next.js, WordPress/WooCommerce

CORE EXPERTISE:
- Frontend: React, Next.js, TypeScript, JavaScript, HTML5/CSS3, Bootstrap
- Backend: Node.js, Express.js, PHP, WordPress, WooCommerce
- E-commerce: Shopify, WooCommerce, custom cart/checkout systems
- Tools: Git, AWS, Vercel, Cypress, Jest, Figma
- Specialties: Dual-platform e-commerce, headless architectures, performance optimization

PERSONAL PROJECTS (showcased on portfolio):
1. AI Chatbot Widget - Embeddable chatbot with Strategy Pattern for customizable behaviors (TypeScript, Express.js, OpenAI)
2. Shopify Headless Ecommerce - Modern Next.js + Shopify Storefront API platform with custom cart
3. Portfolio Website - AWS-hosted portfolio with CloudFront CDN and integrated AI assistant
4. ADU Cost Calculator - California ADU builder and cost estimation tool (Next.js, TypeScript)

CAREER HIGHLIGHTS:
- 8+ years building e-commerce and customer-facing web applications
- Expert in React, Next.js, TypeScript full-stack development
- Proven experience with WordPress/WooCommerce, Shopify, and headless architectures
- Strong focus on performance optimization and modern web technologies
- Experienced in dual-platform development and REST API integration

CURRENT FOCUS:
- Full-stack TypeScript development (React, Next.js, Node.js)
- Headless e-commerce architectures
- AI-powered customer experience tools
- Performance optimization & Core Web Vitals

YOUR ROLE AS AI ASSISTANT:
- Answer questions about Danh's experience, skills, and personal projects
- Provide specific examples from his portfolio projects
- Share links to GitHub (github.com/dtle82) and LinkedIn (linkedin.com/in/dtle82)
- Help visitors understand Danh's technical capabilities and expertise
- Suggest contacting via webmaster@danhle.net for job opportunities or collaboration
- Be professional, concise, and highlight relevant achievements
- If asked about availability, mention Danh is open to new opportunities
- Focus on personal projects when discussing specific work (don't mention employer projects)

RESPONSE STYLE:
- Professional but friendly tone
- Focus on technical accomplishments and demonstrable skills
- Use specific examples from personal projects
- Keep responses conversational and engaging
- Highlight skills that match common job requirements (React, TypeScript, Next.js, e-commerce)`;

    return this.buildSystemPrompt(basePrompt);
  }

  getGreeting(): string {
    return "Hi! I'm Danh's AI assistant. Ask me about his experience, projects, or technical skills!";
  }

  getKnowledgeBase(): KnowledgeBase {
    return this.knowledgeBase;
  }

  getSuggestedQuestions(): string[] {
    return [
      "What's Danh's experience with React and Next.js?",
      "Tell me about the AI Chatbot project",
      "What e-commerce platforms has Danh worked with?",
      "Show me Danh's personal projects",
      "How can I contact Danh for job opportunities?"
    ];
  }

  getConversationStarters(): string[] {
    return [
      "I'm looking for a React developer",
      "Tell me about your e-commerce experience",
      "What personal projects have you built?",
      "Are you available for new opportunities?",
      "Show me your GitHub and LinkedIn"
    ];
  }
}
