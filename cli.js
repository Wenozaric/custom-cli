#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import * as p from '@clack/prompts'
import pc from 'picocolors'

async function main() {
	console.log('')
	p.intro(pc.bgCyan(pc.black('Wenozaric`s custom cli, version: 1.0.0')))

	let componentName = process.argv[2]

	if (!componentName) {
		const nameResponse = await p.text({
			message: 'Name of your new component',
			placeholder: 'Button',
			validate(value) {
				const trimmed = value.trim()

				if (trimmed.length < 2) {
					return 'Имя слишком короткое (минимум 2 символа)!'
				}

				const isValidName = /^[a-zA-Z0-9_-]+$/.test(trimmed)
				if (!isValidName) {
					return 'Имя может содержать только буквы, цифры, дефисы и знаки подчеркивания!'
				}
			},
		})

		if (p.isCancel(nameResponse)) {
			p.cancel('Операция отменена')
			process.exit(0)
		}
		componentName = nameResponse
	}

	//componentName = componentName.trim().charAt(0).toUpperCase() + componentName.trim().slice(1)

	const answers = await p.group({
		elementType: () =>
			p.select({
				message: 'Choose file extension:',
				options: [
					{ value: '.jsx', label: '.jsx (React)' },
					{ value: '.tsx', label: '.tsx (React + TS)' },
					{ value: '.html', label: '.html' },
				],
			}),

		styleType: ({ results }) => {
			if (results.elementType === '.html') {
				return Promise.resolve('none')
			}

			return p.select({
				message: 'Choose style type:',
				options: [
					{ value: 'module', label: 'CSS Modules (component.module.css)' },
					{ value: 'css', label: 'Default CSS (component.css)' },
					{ value: 'none', label: 'Without styles / you`re using TailwindCSS' },
				],
			})
		},
	})

	if (p.isCancel(answers.elementType) || p.isCancel(answers.styleType)) {
		p.cancel('Canceled')
		process.exit(0)
	}

	const elementType = answers.elementType
	const styleType = answers.styleType
    
	const folderPath = path.join(process.cwd())
    const checkFileExists = folderPath + '\\' + componentName + elementType

    p.log.info('Path to file: ' + checkFileExists)

	if (fs.existsSync(checkFileExists)) {
		p.log.error(
			`Into folder ${componentName} already exsist, choose another name!`,
		)
		process.exit(1)
	}

	const s = p.spinner()
	s.start('Generating component...')

	try {
		await new Promise(resolve => setTimeout(resolve, 600))

        let imports = ''
        if (styleType === 'module') {
            imports += `import styles from './${componentName}.module.css';\n`
        } else if (styleType === 'css') {
            imports += `import './${componentName}.css';\n`
        }

		const componentTemplate =
			(elementType == '.jsx') | (elementType == '.tsx')
				? `export const ${componentName.trim().charAt(0).toUpperCase() + componentName.trim().slice(1)} = () => {
    return (
        <div className={${styleType === 'module' ? 'styles.container' : "'container'"}}>
            <h1>${componentName}</h1>
        </div>
    );
};`
				: `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            background-color: #f4f4f4;
        }
        .container {
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${componentName} generated!</h1>
    </div>
</body>
</html>`    
		fs.writeFileSync(
			path.join(folderPath, `${componentName}` + elementType),
			imports.length > 1 ? imports + componentTemplate: componentTemplate,
		)

		if (styleType === 'module') {
			fs.writeFileSync(
				path.join(folderPath, `${componentName}.module.css`),
				'.container {\n  padding: 20px;\n}',
			)
		} else if (styleType === 'css') {
			fs.writeFileSync(
				path.join(folderPath, `${componentName}.css`),
				'.container {\n  padding: 20px;\n}',
			)
		}

		//s.stop()
		s.stop(pc.cyan(`Component successfully created, path: ${folderPath}`))
	} catch (error) {
		s.stop(pc.red('Error while creating component'))
		console.error(error)
	}
}

main()
