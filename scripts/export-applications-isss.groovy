import hudson.maven.*
import groovy.json.*
import hudson.plugins.promoted_builds.JobPropertyImpl

def items = Jenkins.instance.getAllItems(MavenModuleSet.class)
def list = []

class ListItem {
  def project = ""
  def app = ""
  def env = []
}

items.each{ 
  def pbProp = it.getProperty(JobPropertyImpl)
  def bindingRegex = ~"^targetEnvironment="
  if (pbProp && (it.name.endsWith('war') || it.name.endsWith('ear'))) {
    def listItem = new ListItem()
    listItem.project = it.getParent().name
    listItem.app = it.name
    for (def process : pbProp.getActiveItems()) {
      def buildStep = process.getBuildSteps()[0];
      if (buildStep) {
        listItem.env << buildStep.getBindings().replaceFirst(bindingRegex, "")
      }
    }
    list << listItem
  }
}
println (new groovy.json.JsonBuilder(list)).toString()
return

