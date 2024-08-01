$(()=> {
    const $forms = $('.js-form');
    $forms.each(initForms)

    function initForms(_, f) {
        const $form = $(f);

        $form.on('submit', function (e) {
            e.preventDefault();
            const fields = $(e.target.elements).filter('input, textarea');

            if (!validate(fields)) {
                $.ajax({
                    type: 'POST',
                    url: e.target.dataset.post || '',
                    data: $(e.target).serialize(),
                }).always(()=> {
                    [...fields].forEach(f => f.value = '')
                })
            }
        })

        $form.on('input', function (e) {
            if (e.target.classList.contains('is-error')) {
                e.target.classList.remove('is-error')
            }
        })

        function validate(fields) {
            const errors = [...fields].map((f)=> {
                console.log(f.value !== '', f.name === 'phone', f.value.length < 18)
                if (f.value === '') {
                    f.classList.add('is-error')
                    return true;
                }
                if (f.value !== '' && f.name === 'email' && !(/\S+@\S+\.\S+/).test(f.value)) {
                    f.classList.add('is-error')
                    return true;
                }
                if (f.value !== '' && f.name === 'phone' && f.value.length < 18) {
                    f.classList.add('is-error')
                    return true;
                }
                return false;
            });
            fields.filter('.is-error').eq(0)?.focus()

            return errors.find(item => item) || false
        }
    }
});