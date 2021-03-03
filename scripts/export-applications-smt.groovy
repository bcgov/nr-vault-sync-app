import hudson.maven.*
import groovy.json.*
import hudson.plugins.promoted_builds.JobPropertyImpl
import hudson.plugins.groovy.SystemGroovy

def items = Jenkins.instance.getAllItems(FreeStyleProject.class);
def list = []

class ListItem {
  def project = ""
  def app = ""
  def env = []
}

Jenkins.instance.getAllItems(FreeStyleProject.class).each{ 
  def pbProp = it.getProperty(JobPropertyImpl)
  def bindingRegex = ~"^targetEnvironment="
  if (pbProp && it.getParent().name != "SYS") {
    def listItem = new ListItem()
    listItem.project = it.getParent().name
    listItem.app = it.name
    for (def process : pbProp.getActiveItems()) {
      for (def buildStep : process.getBuildSteps()) {
        if (buildStep instanceof SystemGroovy) {
          def env =  buildStep.getBindings().replaceFirst(bindingRegex, "")
          env = env.readLines()[0]
          listItem.env << env
        }
      }
    }
    if (listItem.env) {
      list << listItem
    }
  }
}
println (new groovy.json.JsonBuilder(list)).toString()
return
