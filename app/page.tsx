import ContactForm from './components/ContactForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold text-gray-100">VectorStrat AI</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#projects" className="text-gray-300 hover:text-amber-400 transition-colors">Projects</a>
              <a href="#about" className="text-gray-300 hover:text-amber-400 transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-amber-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-100 mb-6">
              AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-stone-300">
                Innovation
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Exploring the frontier of artificial intelligence through practical projects and strategic implementations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#projects" 
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/20"
              >
                View Projects
              </a>
              <a 
                href="#contact" 
                className="px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 text-gray-100 font-semibold rounded-lg transition-colors border border-gray-700/50"
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
          <h2 className="text-4xl font-bold text-gray-100 mb-4 text-center">Featured Projects</h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
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
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">About VectorStrat AI</h2>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            VectorStrat AI is a portfolio showcasing practical applications of artificial intelligence 
            and machine learning. Each project represents a strategic approach to solving real-world 
            problems using cutting-edge AI technologies.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
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
            <h2 className="text-4xl font-bold text-gray-100 mb-6">Get In Touch</h2>
            <p className="text-lg text-gray-300">
              Interested in collaboration or want to learn more about these AI projects?
            </p>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
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
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        <span className="text-xs px-3 py-1 bg-amber-900/40 text-amber-300 rounded-full border border-amber-700/30">{status}</span>
      </div>
      <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="text-xs px-3 py-1 bg-gray-900/40 text-gray-300 rounded-full border border-gray-700/40">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
