const { existsSync } = require("fs")
const { copyFile, mkdir, rm } = require("fs/promises")

const commander = require('commander')

const inquirer = require("inquirer")
const { generalQuestions } = require('./questions')

const { createChartYaml, createComponents, createJobs, createCronJobs } = require('./functions')

commander
  .name('helm-chart-generator')
  .version('1.0.0-alpha', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-o, --charts-output-path <path>', 'set the output path of the generated chart')
  .addHelpText('after', `

  Example call:
    $ helm-chart-generator -o ./generated-charts`)
  .showHelpAfterError()
  .parse(process.argv)

const options = commander.opts()

const ROOT_OUTPUT_DIR = process.env.ROOT_OUTPUT_DIR || options.chartsOutputPath || "./generated-charts/"
let CHART_OUTPUT_DIR = ""

const runGenerator = async () => {
  try {
    // create output folder
    if (!existsSync(ROOT_OUTPUT_DIR)) mkdir(ROOT_OUTPUT_DIR)

    // general questions
    console.log("Chart general information")
    console.log("=====================")
    const answers = await inquirer.prompt(generalQuestions)
    CHART_OUTPUT_DIR = (!ROOT_OUTPUT_DIR.endsWith("/") && !ROOT_OUTPUT_DIR.endsWith("\\")) ? ROOT_OUTPUT_DIR + "/" + answers.name : ROOT_OUTPUT_DIR + answers.name

    if (existsSync(CHART_OUTPUT_DIR)){
      const date = new Date();
      CHART_OUTPUT_DIR += "-" + date.getTime()
      console.log("")
      console.log("---------------------")
      console.error("The Helm chart \"" + answers.name + "\" has already been created, so it will be stored inside a new folder using the current Unix timestamp. This new folder will be named \"" + CHART_OUTPUT_DIR +"\"")
    }

    // create chart root folder
    await mkdir(CHART_OUTPUT_DIR)

    // create global files and folders
    mkdir(CHART_OUTPUT_DIR + "/charts")
    mkdir(CHART_OUTPUT_DIR + "/crds")
    await mkdir(CHART_OUTPUT_DIR + "/templates")
    copyFile(__dirname + "/templates/global/.helmignore", CHART_OUTPUT_DIR + "/.helmignore")
    await copyFile(__dirname + "/templates/global/values.yaml", CHART_OUTPUT_DIR + "/values.yaml")
    await copyFile(__dirname + "/templates/global/_helpers.tpl", CHART_OUTPUT_DIR + "/templates/_helpers.tpl")

    // create components in templates folder
    console.log("\nChart components")
    console.log("=====================")
    await createComponents(answers.components, CHART_OUTPUT_DIR)

    // create jobs and cronjobs in templates folder
    if (answers.jobs > 0 || answers.cronjobs > 0) await mkdir(CHART_OUTPUT_DIR + "/templates/jobs")
    if (answers.jobs > 0) {
      console.log("\nChart Jobs")
      console.log("=====================")
      await createJobs(answers.jobs, CHART_OUTPUT_DIR)
    }
    if (answers.cronjobs > 0) {
      console.log("\nChart CronJobs")
      console.log("=====================")
      await createCronJobs(answers.cronjobs, CHART_OUTPUT_DIR)
    }

    // create Chart.yaml
    await createChartYaml(answers, CHART_OUTPUT_DIR)

    // create development values.yaml file
    copyFile(CHART_OUTPUT_DIR + "/values.yaml", CHART_OUTPUT_DIR + "/qa-values.yaml")

    console.log("\n=====================")
    console.log("The Helm chart has been successfully generated!!")
    console.log("The generated chart is stored in: " + CHART_OUTPUT_DIR)
    console.log("=====================")

  } catch (error) {
    console.error(error.stack);

    // delete generated chart
    rm(CHART_OUTPUT_DIR, { recursive: true, force: true })
  }
}

runGenerator()
