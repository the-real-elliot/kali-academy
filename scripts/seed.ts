import { db } from "../lib/db/src/index.js";
import { modulesTable, lessonsTable } from "../lib/db/src/schema/index.js";

const modules = [
  { title: "Linux Fundamentals", slug: "linux-fundamentals", description: "Master the Linux command line — the hacker's home.", difficulty: "beginner" as const, category: "Linux", order: 1 },
  { title: "Network Recon", slug: "network-recon", description: "Scan, enumerate and map networks like a pro.", difficulty: "beginner" as const, category: "Networking", order: 2 },
  { title: "Web Hacking Basics", slug: "web-hacking", description: "XSS, SQLi, IDOR — break web apps legally.", difficulty: "intermediate" as const, category: "Web", order: 3 },
  { title: "Bug Bounty Hunting", slug: "bug-bounty", description: "Find real vulnerabilities and get paid.", difficulty: "intermediate" as const, category: "Bug Bounty", order: 4 },
  { title: "Privilege Escalation", slug: "privesc", description: "Go from user to root on Linux systems.", difficulty: "advanced" as const, category: "Linux", order: 5 },
  { title: "Exploit Development", slug: "exploit-dev", description: "Write your own exploits from scratch.", difficulty: "advanced" as const, category: "Exploitation", order: 6 },
];

const lessons = [
  // Linux Fundamentals
  { moduleSlug: "linux-fundamentals", title: "Navigating the Filesystem", slug: "filesystem", order: 1, duration: 15, content: "Learn ls, cd, pwd, find commands.", commands: [{ command: "ls -la", description: "List all files", output: "drwxr-xr-x root root ." }, { command: "find / -name flag.txt", description: "Find files", output: "/home/user/flag.txt" }] },
  { moduleSlug: "linux-fundamentals", title: "File Permissions", slug: "permissions", order: 2, duration: 20, content: "chmod, chown, SUID explained.", commands: [{ command: "chmod +x script.sh", description: "Make executable", output: "" }, { command: "find / -perm -4000", description: "Find SUID", output: "/usr/bin/passwd" }] },
  { moduleSlug: "linux-fundamentals", title: "Users & Groups", slug: "users-groups", order: 3, duration: 15, content: "Managing users and groups.", commands: [{ command: "whoami", description: "Current user", output: "elliot" }, { command: "id", description: "User info", output: "uid=1000(elliot) gid=1000(elliot)" }] },

  // Network Recon  
  { moduleSlug: "network-recon", title: "Nmap Basics", slug: "nmap-basics", order: 1, duration: 20, content: "Port scanning with nmap.", commands: [{ command: "nmap -sV 192.168.1.1", description: "Service scan", output: "22/tcp open ssh OpenSSH 8.0" }, { command: "nmap -A target.com", description: "Aggressive scan", output: "OS: Linux 4.x" }] },
  { moduleSlug: "network-recon", title: "Gobuster & Dirbusting", slug: "gobuster", order: 2, duration: 25, content: "Find hidden directories.", commands: [{ command: "gobuster dir -u http://target.com -w wordlist.txt", description: "Dir bruteforce", output: "/admin (Status: 200)" }] },
  { moduleSlug: "network-recon", title: "Passive Recon & OSINT", slug: "osint", order: 3, duration: 20, content: "Whois, shodan, theHarvester.", commands: [{ command: "whois target.com", description: "Domain info", output: "Registrar: GoDaddy" }, { command: "theHarvester -d target.com -b google", description: "Email harvest", output: "admin@target.com" }] },

  // Web Hacking
  { moduleSlug: "web-hacking", title: "SQL Injection", slug: "sqli", order: 1, duration: 30, content: "Break login forms with SQLi.", commands: [{ command: "sqlmap -u 'http://target.com?id=1' --dbs", description: "Auto SQLi", output: "available databases: [users, admin]" }] },
  { moduleSlug: "web-hacking", title: "XSS Attacks", slug: "xss", order: 2, duration: 25, content: "Reflected and stored XSS.", commands: [{ command: "<script>alert(1)</script>", description: "Basic XSS", output: "Alert box triggered" }] },
  { moduleSlug: "web-hacking", title: "Burp Suite Basics", slug: "burpsuite", order: 3, duration: 35, content: "Intercept and modify requests.", commands: [{ command: "burpsuite &", description: "Launch Burp", output: "Burp Suite starting..." }] },

  // Bug Bounty
  { moduleSlug: "bug-bounty", title: "Recon for Bug Bounty", slug: "bb-recon", order: 1, duration: 30, content: "Subdomain enum, wayback machine.", commands: [{ command: "subfinder -d target.com", description: "Find subdomains", output: "api.target.com\nadmin.target.com" }] },
  { moduleSlug: "bug-bounty", title: "Writing Reports", slug: "bb-reports", order: 2, duration: 20, content: "How to write professional bug reports.", commands: [{ command: "# Impact, Steps to Reproduce, PoC", description: "Report structure", output: "" }] },

  // Privilege Escalation
  { moduleSlug: "privesc", title: "LinPEAS & Enumeration", slug: "linpeas", order: 1, duration: 30, content: "Automate privesc enumeration.", commands: [{ command: "curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh", description: "Run LinPEAS", output: "SUID: /usr/bin/python3" }] },
  { moduleSlug: "privesc", title: "Cron Job Exploitation", slug: "cron-exploit", order: 2, duration: 25, content: "Abuse misconfigured cron jobs.", commands: [{ command: "cat /etc/crontab", description: "View crons", output: "* * * * * root /tmp/backup.sh" }] },

  // Exploit Dev
  { moduleSlug: "exploit-dev", title: "Buffer Overflow Basics", slug: "bof", order: 1, duration: 45, content: "Stack based buffer overflow.", commands: [{ command: "python3 -c 'print(\"A\"*500)' | ./vuln", description: "Crash binary", output: "Segmentation fault" }] },
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Insert modules
  const insertedModules = await db.insert(modulesTable).values(modules).returning();
  console.log(`✅ Inserted ${insertedModules.length} modules`);

  // Create slug->id map
  const moduleMap = new Map(insertedModules.map(m => [m.slug, m.id]));

  // Insert lessons
  const lessonsToInsert = lessons.map(l => ({
    moduleId: moduleMap.get(l.moduleSlug)!,
    title: l.title,
    slug: l.slug,
    order: l.order,
    duration: l.duration,
    content: l.content,
    commands: l.commands,
  }));

  const insertedLessons = await db.insert(lessonsTable).values(lessonsToInsert).returning();
  console.log(`✅ Inserted ${insertedLessons.length} lessons`);
  console.log("🔥 DONE!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
