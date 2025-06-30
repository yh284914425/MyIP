<template>
  <div class="learn-page">
    <!-- Hero Section -->
    <div class="learn-hero text-center mb-5">
      <div class="hero-content">
        <div class="hero-icon mb-4">📚</div>
        <h1 class="hero-title mb-3">Learn About DNS Security</h1>
        <p class="hero-subtitle mb-4">
          Master DNS leak protection with our comprehensive guides and tutorials
        </p>
      </div>
    </div>

    <!-- Featured Articles -->
    <div class="featured-articles mb-5">
      <h2 class="section-title mb-4">Essential Reading</h2>
      <div class="row">
        <div v-for="article in featuredArticles" :key="article.id" class="col-lg-4 col-md-6 mb-4">
          <div class="article-card h-100" @click="openArticle(article)">
            <div class="article-icon">{{ article.icon }}</div>
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <div class="article-meta">
              <span class="reading-time">{{ article.readingTime }} min read</span>
              <span class="article-tag">{{ article.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Tips Section -->
    <div class="quick-tips mb-5">
      <h2 class="section-title mb-4">Quick Security Tips</h2>
      <div class="row">
        <div v-for="tip in quickTips" :key="tip.id" class="col-md-6 mb-3">
          <div class="tip-card">
            <div class="tip-icon">{{ tip.icon }}</div>
            <div class="tip-content">
              <h4 class="tip-title">{{ tip.title }}</h4>
              <p class="tip-description">{{ tip.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section">
      <h2 class="section-title mb-4">Frequently Asked Questions</h2>
      <div class="accordion" id="faqAccordion">
        <div v-for="(faq, index) in faqs" :key="faq.id" class="accordion-item">
          <h3 class="accordion-header">
            <button 
              class="accordion-button"
              :class="{ collapsed: index !== 0 }"
              type="button" 
              data-bs-toggle="collapse" 
              :data-bs-target="`#faq${faq.id}`">
              {{ faq.question }}
            </button>
          </h3>
          <div 
            :id="`faq${faq.id}`" 
            class="accordion-collapse collapse"
            :class="{ show: index === 0 }"
            data-bs-parent="#faqAccordion">
            <div class="accordion-body">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Article Modal -->
  <div class="modal fade" id="articleModal" tabindex="-1" aria-hidden="true"
       :data-bs-theme="isDarkMode ? 'dark' : 'light'">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ selectedArticle?.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="selectedArticle">
          <div class="article-meta mb-4">
            <span class="badge bg-primary me-2">{{ selectedArticle.category }}</span>
            <span class="text-muted">{{ selectedArticle.readingTime }} min read</span>
          </div>
          <div class="article-content" v-html="selectedArticle.content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 使用Nuxt composables
const store = useMainStore();
const isDarkMode = computed(() => store.isDarkMode);

const selectedArticle = ref(null);

const featuredArticles = ref([
  {
    id: 1,
    title: "What is a DNS Leak?",
    excerpt: "Learn the basics of DNS leaks and why they matter for your online privacy and security.",
    icon: "🔍",
    readingTime: 5,
    category: "Basics",
    content: `
      <h4>Understanding DNS Leaks</h4>
      <p>A DNS leak occurs when your DNS queries bypass your VPN tunnel and are sent directly to your ISP's DNS servers, potentially exposing your browsing activity and real location.</p>
      
      <h5>How DNS Works</h5>
      <p>When you visit a website, your device needs to translate the domain name (like google.com) into an IP address. This process is called DNS resolution.</p>
      
      <h5>The Problem with DNS Leaks</h5>
      <ul>
        <li><strong>Privacy Breach:</strong> Your ISP can see which websites you visit</li>
        <li><strong>Location Exposure:</strong> Your real location may be revealed</li>
        <li><strong>Censorship Bypass Failure:</strong> Geo-blocking may still apply</li>
      </ul>
      
      <h5>Common Causes</h5>
      <ul>
        <li>Misconfigured VPN settings</li>
        <li>IPv6 connectivity when VPN only supports IPv4</li>
        <li>Operating system DNS cache issues</li>
        <li>Transparent DNS proxy by ISP</li>
      </ul>
    `
  },
  {
    id: 2,
    title: "How to Fix DNS Leaks",
    excerpt: "Step-by-step guide to preventing and fixing DNS leaks across different devices and VPN providers.",
    icon: "🔧",
    readingTime: 8,
    category: "Tutorial",
    content: `
      <h4>Fixing DNS Leaks: Complete Guide</h4>
      
      <h5>1. Enable DNS Leak Protection</h5>
      <p>Most modern VPN clients offer built-in DNS leak protection. Enable this feature in your VPN settings.</p>
      
      <h5>2. Use Custom DNS Servers</h5>
      <p>Configure your VPN to use secure DNS servers:</p>
      <ul>
        <li><strong>Cloudflare:</strong> 1.1.1.1, 1.0.0.1</li>
        <li><strong>Quad9:</strong> 9.9.9.9, 149.112.112.112</li>
        <li><strong>Google:</strong> 8.8.8.8, 8.8.4.4</li>
      </ul>
      
      <h5>3. Disable IPv6</h5>
      <p>If your VPN doesn't support IPv6, disable it to prevent leaks:</p>
      <ul>
        <li><strong>Windows:</strong> Network settings → Change adapter options → Disable IPv6</li>
        <li><strong>macOS:</strong> System Preferences → Network → Advanced → TCP/IP → Off</li>
        <li><strong>Linux:</strong> Edit /etc/sysctl.conf</li>
      </ul>
      
      <h5>4. Flush DNS Cache</h5>
      <p>After making changes, flush your DNS cache:</p>
      <ul>
        <li><strong>Windows:</strong> <code>ipconfig /flushdns</code></li>
        <li><strong>macOS:</strong> <code>sudo dscacheutil -flushcache</code></li>
        <li><strong>Linux:</strong> <code>sudo systemctl restart systemd-resolved</code></li>
      </ul>
    `
  },
  {
    id: 3,
    title: "Choosing a Secure VPN",
    excerpt: "Essential criteria for selecting a VPN that properly protects against DNS leaks and other privacy threats.",
    icon: "🛡️",
    readingTime: 10,
    category: "Guide",
    content: `
      <h4>Selecting a DNS-Secure VPN</h4>
      
      <h5>Essential Features</h5>
      <ul>
        <li><strong>Built-in DNS Leak Protection:</strong> Automatic prevention of DNS leaks</li>
        <li><strong>Kill Switch:</strong> Blocks internet if VPN connection drops</li>
        <li><strong>No-logs Policy:</strong> Verified by third-party audits</li>
        <li><strong>IPv6 Support:</strong> Or proper IPv6 blocking</li>
      </ul>
      
      <h5>VPN Protocols</h5>
      <p>Modern protocols offer better security:</p>
      <ul>
        <li><strong>WireGuard:</strong> Fast, modern, and secure</li>
        <li><strong>OpenVPN:</strong> Time-tested and reliable</li>
        <li><strong>IKEv2:</strong> Good for mobile devices</li>
      </ul>
      
      <h5>Red Flags to Avoid</h5>
      <ul>
        <li>Free VPNs (often log and sell data)</li>
        <li>VPNs based in 5/9/14 Eyes countries</li>
        <li>No kill switch or DNS leak protection</li>
        <li>Vague privacy policies</li>
      </ul>
      
      <h5>Testing Your VPN</h5>
      <p>Always test your VPN after setup:</p>
      <ul>
        <li>Use DNS leak tests like SecureDNSCheck</li>
        <li>Check for IP leaks</li>
        <li>Test the kill switch functionality</li>
        <li>Verify geo-location changes</li>
      </ul>
    `
  }
]);

const quickTips = ref([
  {
    id: 1,
    icon: "⚡",
    title: "Test Regularly",
    description: "Run DNS leak tests monthly or after VPN configuration changes"
  },
  {
    id: 2,
    icon: "🔄",
    title: "Update VPN Software",
    description: "Keep your VPN client updated for latest security fixes"
  },
  {
    id: 3,
    icon: "📱",
    title: "Test All Devices",
    description: "Check for DNS leaks on each device separately"
  },
  {
    id: 4,
    icon: "🌐",
    title: "Use Secure DNS",
    description: "Configure secure DNS servers even outside VPN"
  }
]);

const faqs = ref([
  {
    id: 1,
    question: "How often should I test for DNS leaks?",
    answer: "We recommend testing for DNS leaks at least once a month, or whenever you change your VPN settings, update your VPN software, or switch to a new VPN provider. It's also wise to test after major system updates."
  },
  {
    id: 2,
    question: "Can DNS leaks happen even with a premium VPN?",
    answer: "Yes, DNS leaks can occur with any VPN if not configured properly. Even premium VPNs can have misconfigurations or software bugs. This is why regular testing is essential regardless of your VPN provider."
  },
  {
    id: 3,
    question: "Is it safe to use public DNS servers?",
    answer: "Reputable public DNS servers like Cloudflare (1.1.1.1) and Quad9 (9.9.9.9) are generally safe and often more secure than your ISP's DNS. However, the safest approach is using your VPN provider's DNS servers."
  },
  {
    id: 4,
    question: "What's the difference between DNS leaks and IP leaks?",
    answer: "DNS leaks expose which websites you visit through DNS queries, while IP leaks expose your real IP address. Both are privacy concerns, but DNS leaks are more subtle and harder to detect without proper testing."
  }
]);

const openArticle = (article) => {
  selectedArticle.value = article;
  if (process.client && window.bootstrap) {
    const modal = new window.bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
  }
};
</script>

<style scoped>
.learn-hero {
  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 1) 0%, 
    rgba(241, 245, 249, 1) 100%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 3rem 2rem;
  margin: 2rem 0;
}

[data-bs-theme="dark"] .learn-hero {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 1) 0%, 
    rgba(2, 6, 23, 1) 100%);
}

.hero-icon {
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(29, 78, 216, 0.2));
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--muted-foreground);
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 2rem;
}

.article-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--chart-2);
}

.article-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
}

.article-excerpt {
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.reading-time {
  color: var(--muted-foreground);
}

.article-tag {
  background: var(--chart-1);
  color: var(--foreground);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.tip-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.tip-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.tip-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.tip-description {
  color: var(--muted-foreground);
  font-size: 0.9rem;
  margin: 0;
}

.accordion-item {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.accordion-button {
  background: var(--background);
  color: var(--foreground);
  border: none;
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background: var(--background);
  color: var(--foreground);
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: 0 0 0 2px var(--chart-2);
}

.accordion-body {
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.6;
}

.article-content {
  line-height: 1.7;
}

.article-content h4, .article-content h5 {
  color: var(--foreground);
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.article-content h4 {
  font-size: 1.5rem;
  font-weight: 600;
}

.article-content h5 {
  font-size: 1.25rem;
  font-weight: 600;
}

.article-content ul {
  margin-bottom: 1.5rem;
}

.article-content li {
  margin-bottom: 0.5rem;
}

.article-content code {
  background: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .learn-hero {
    padding: 2rem 1rem;
  }
  
  .article-card {
    padding: 1.5rem;
  }
  
  .tip-card {
    padding: 1rem;
  }
}
</style>