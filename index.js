const { promises: fs } = require("fs");
const { exec } = require("child_process");
const readme = require("./readme");

const msInOneDay = 1000 * 60 * 60 * 24;
const today = new Date();

function generateNewREADME() {
  const readmeRow = readme.split("\n");

  function updateIdentifier(identifier, replaceText) {
    const identifierIndex = findIdentifierIndex(readmeRow, identifier);
    if (!readmeRow[identifierIndex]) return;
    readmeRow[identifierIndex] = readmeRow[identifierIndex].replace(
      `<#${identifier}>`,
      replaceText
    );
  }

  const identifierToUpdate = {
    day_before_new_years: getDBNWSentence(),
    today_date: getTodayDate(),
    gabot_signing: getGabotSigning(),
  };

  Object.entries(identifierToUpdate).forEach(([key, value]) => {
    updateIdentifier(key, value);
  });

  return readmeRow.join("\n");
}

const moodByDay = {
  1: "hate",
  2: "wickedness",
  3: "pleasure",
  4: "wickedness",
  5: "cruelty",
  6: "horror",
  7: "love",
};

function getGabotSigning() {
  const mood = moodByDay[today.getDay() + 1];
  return `🤖 This README.md is updated with ${mood}, by Gabot ❤️`;
}

function getTodayDate() {
  return today.toDateString();
}

function getMySelf() {
  return today.getDate() % 2 === 0
    ? Math.floor(Math.random() * 2)
      ? "penguin 🐧"
      : "bear 🐻"
    : "penguin bear 🐧🐻";
}

function getDBNWSentence() {
  const nextYear = today.getFullYear() + 1;
  const nextYearDate = new Date(String(nextYear));
  const timeUntilNewYear = nextYearDate.getTime() - today.getTime();
  const dayUntilNewYear = Math.round(timeUntilNewYear / msInOneDay);
  return `**${dayUntilNewYear} day before ${nextYear} ⏱**`;
}

const findIdentifierIndex = (rows, identifier) =>
  rows.findIndex((r) => Boolean(r.match(new RegExp(`<#${identifier}>`, "i"))));

async function updateREADMEFile(text) {
  try {
    await fs.writeFile("./README.md", text);
    return true;
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
}

async function gitCommitAndPush() {
  try {
    const commands = [
      "git add README.md",
      'git config --global user.email "issadiop2580@gmail.com"',
      'git config --global user.name "issa2580"',
      'git commit -m ":memo: README.md updated by Gabot"',
      "git push origin main",
    ];

    for (const command of commands) {
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error && !error.message.includes("nothing to commit")) {
            console.error(`Error executing ${command}: ${error}`);
            reject(error);
            return;
          }
          console.log(`Executed: ${command}`);
          console.log(stdout);
          resolve();
        });
      });
    }
    console.log("Successfully pushed to GitHub");
  } catch (error) {
    console.error("Error during git operations:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Starting README update...");
    const newREADME = generateNewREADME();
    console.log("New README generated");

    await updateREADMEFile(newREADME);
    console.log("README.md updated successfully");

    await gitCommitAndPush();
    console.log("Changes pushed to GitHub");
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
}

main();
