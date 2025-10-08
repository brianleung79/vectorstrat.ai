export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold text-slate-100">VectorStrat AI</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#projects" className="text-slate-300 hover:text-cyan-400 transition-colors">Projects</a>
              <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors">About</a>
              <a href="#contact" className="text-slate-300 hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-100 mb-6">
              AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Innovation
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto">
              Exploring the frontier of artificial intelligence through practical projects and strategic implementations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#projects" 
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              >
                View Projects
              </a>
              <a 
                href="#contact" 
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition-colors border border-slate-600"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-100 mb-4 text-center">Featured Projects</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            A collection of AI projects demonstrating machine learning, data analysis, and innovative solutions
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card Template - Add your actual projects here */}
            <ProjectCard 
              title="Coming Soon"
              description="Exciting AI projects will be showcased here. Each project represents a unique exploration in artificial intelligence and machine learning."
              tags={["Machine Learning", "Python", "Data Science"]}
              status="In Development"
            />
            <ProjectCard 
              title="Project Pipeline"
              description="More innovative AI solutions are in the works. Stay tuned for cutting-edge implementations and practical applications."
              tags={["Deep Learning", "NLP", "Computer Vision"]}
              status="Planned"
            />
            <ProjectCard 
              title="Future Innovation"
              description="The journey of AI exploration continues. Each project will push boundaries and explore new possibilities in artificial intelligence."
              tags={["AI Research", "Automation", "Analytics"]}
              status="Concept"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-100 mb-6">About VectorStrat AI</h2>
          <p className="text-lg text-slate-300 mb-6 leading-relaxed">
            VectorStrat AI is a portfolio showcasing practical applications of artificial intelligence 
            and machine learning. Each project represents a strategic approach to solving real-world 
            problems using cutting-edge AI technologies.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            From data analysis to predictive modeling, from natural language processing to computer vision, 
            these projects demonstrate the transformative power of AI when applied with strategic thinking 
            and technical expertise.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-100 mb-6">Get In Touch</h2>
            <p className="text-lg text-slate-300">
              Interested in collaboration or want to learn more about these AI projects?
            </p>
          </div>
          
          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">Send a Message</h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  placeholder="Tell me about your project or collaboration idea..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} VectorStrat AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status: string;
}

function ProjectCard({ title, description, tags, status }: ProjectCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        <span className="text-xs px-3 py-1 bg-slate-700 text-cyan-400 rounded-full">{status}</span>
      </div>
      <p className="text-slate-400 mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="text-xs px-3 py-1 bg-slate-900 text-slate-300 rounded-full border border-slate-700">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
