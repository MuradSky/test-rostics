class FromLib {
    constructor($form, params) {
        this.$form = typeof $form === 'string' ? document.querySelector($form) : $form
        this.params = {
            isTouched: false,
            disable: false,
            ...params
        }
        this.validation = {}
        this.$submitBtn = this.$form.querySelector('button[type="submit"]') || null
        this.mounted()
    }

    mounted() {
        this.setValidation()
        this.checkFieldsFilled()
        this.inputListen()
        this.submitHandler()
    }

    setDisabledBtn(isError) {
        if ((isError && this.$submitBtn) || (this.params.disabled && this.$submitBtn)) {
            this.$submitBtn?.setAttribute('disabled', true)
        }
    }

    createErrorField(text) {
        const errorEl = document.createElement('span')
        errorEl.textContent = text
        errorEl.classList.add('error-field')
        return errorEl
    }

    removeDisableBtn() {
        if (this.$submitBtn) this.$submitBtn.removeAttribute('disabled')
    }

    inputListen() {
        this.$form.addEventListener('input', (e)=> {
            const field = e.target.closest('input') || e.target.closest('textarea')
            if (field) {
                this.bindingField(field)

                if (this.params.isTouched) {
                    this.checkField(field.name)
                    this.checkFieldsFilled(true)
                }
            }
        })
    }

    bindingField(field) {
        if (this.validation[field.name]) {
            field.value = this.validation[field.name].value = field.value
            if (field.value) this.validation[field.name].isFilled = true
            else this.validation[field.name].isFilled = false
        }
    }

    insertAfter(newNode, existingNode) {
        existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
    }

    removeErrorField(node) {
        node.nextSibling?.remove()
    }

    checkField(name) {
        const field = this.validation[name]
        if (field && field.required) {
            const input = this.$form.querySelector(`input[name="${field.name}"]`)
            console.log(field)
            if (field.value !== '') {
                this.validation[field.name].isError = false
                input.classList.remove(this.params.errorClass || 'is-error')
                this.removeErrorField(input)
            } else {
                this.validation[field.name].isError = true
                input.classList.add(this.params.errorClass || 'is-error')
                this.insertAfter(this.createErrorField(field.message), input)
            }
        }
    }

    checkFieldsFilled(isError) {
        const isNotFilled = Object.keys(this.validation).map(key=>({...this.validation[key]}))
            .filter(item => item.required)
            .findIndex(item => !item.isFilled || item.isError) !== -1
        if (isNotFilled) this.setDisabledBtn(isError)
        else this.removeDisableBtn()
    }

    setValidation() {
        const checkInputValue = name=> {
            const input = this.$form.querySelector(`input[name="${name}"]`)
            return input ? input.value : ''
        }

        Object.keys(this.params.fields).forEach(item => {
            const value = checkInputValue(item)
            const param = this.params.fields[item]
            this.validation[item] = {
                name: item,
                required: param.required || null,
                message: param.message || null,
                isError: false,
                isFilled: !!value,
                value,
                regex: null,
            }
        })
    }

    toggleErrors() {
        const requiredField = Object.keys(this.validation).map(key=>({...this.validation[key]}))
        .filter(item => item.required)
        requiredField.forEach(item=> {
            const input = this.$form.querySelector(`input[name="${item.name}"]`)
            if (!item.isFilled && item.value === '') {
                this.validation[item.name].isError = true
                input.classList.add(this.params.errorClass || 'is-error')
                this.insertAfter(this.createErrorField(item.message), input)
            } else {
                this.validation[item.name].isError = false
                input.classList.remove(this.params.errorClass || 'is-error')
                this.removeErrorField(input)
            }
        })
    }

    submitHandler() {
        const check = ()=> this.checkFieldsFilled(true)
        const toggleError = ()=> this.toggleErrors()
        const touched = ()=> {if (!this.params.isTouched)  this.params.isTouched = true}
        this.$form.addEventListener('submit', function(e) {
            e.preventDefault()
            check()
            toggleError()
            touched()
        })
    }
}

const form = new FromLib(document.querySelector('.js-form'), {
    errorClass: 'my-erro',
    fields: {
        name: {
            required: true,
            message: 'Field is required!'
        },
        email: {
            required: true,
            message: 'Field is required!'
        }
    }
})