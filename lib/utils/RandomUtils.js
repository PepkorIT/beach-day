"use strict";
exports.RandomUtils = {
    _names: ["Jane Addams", "Muhammad Ali", "Stephen Ambrose", "Maya Angelou", "Elizabeth Arden", "Louis Armstrong", "Neil Armstrong", "Isaac Asimov", "Joan Baez", "Josephine Baker", "Clyde Barrow", "Elizabeth Blackwell", "Molly Brown", "Truman Capote", "Andrew Carnegie", "Rachel Carson", "Jimmy Carter", "Fidel Castro", "Coco Chanel", "Charlie Chaplin", "Agatha Christie", "Marie Curie", "Czar Nicholas", "Dorothy Dandridge", "Joe DiMaggio", "Amelia Earhart", "Thomas Edison", "Albert Einstein", "Enrico Fermi", "Henry Ford", "Dian Fossey", "Anne Frank", "Sigmund Freud", "Yuri Gagarin", "Indira Gandhi", "Mohandas Gandhi", "Theodor Geisel", "John Glenn", "Emma Goldman", "Jane Goodall", "Mikhail Gorbachev", "Cary Grant", "Che Guevara", "Ernest Hemingway", "Audrey Hepburn", "Heinrich Himmler", "Alfred Hitchcock", "Adolf Hitler", "Billie Holiday", "Harry Houdini", "Howard Hughes", "Saddam Hussein", "Jim Jones", "Frida Kahlo", "Helen Keller", "Grace Kelly", "Jackie Kennedy", "Charles Lindbergh", "Joe Louis", "Malcolm X", "Charles Manson", "Thurgood Marshall", "Iqbal Masih", "Mata Hari", "Henri Matisse", "Golda Meir", "Marilyn Monroe", "Mother Teresa", "Benito Mussolini", "Nicholas II", "Richard Nixon", "Sandra O'Connor", "Annie Oakley", "Jesse Owens", "Emmeline Pankhurst", "Bonnie Parker", "Eva Peron", "Pol Pot", "Elvis Presley", "Princess Diana", "Queen Victoria", "Ronald Reagan", "Sally Ride", "Leni Riefenstahl", "Jackie Robinson", "Nicholas Romanov", "Eleanor Roosevelt", "Theodore Roosevelt", "Babe Ruth", "Charles Schulz", "Frank Sinatra", "Joseph Stalin", "Edith Stein", "John Steinbeck", "Jimmy Stewart", "Nikola Tesla", "Margaret Thatcher", "Jim Thorpe", "Leon Trotsky", "Tsar Nicholas", "Queen Victoria", "Pancho Villa", "Alice Walker", "Raoul Wallenberg", "Andy Warhol", "Woodrow Wilson", "Virginia Woolf", "Frank Wright", "Wright Brothers"],
    _companies: ["Acetechnology", "Bluedox", "Kanla", "Betatone", "Freshmedia", "Tampkix", "Domlax", "Dongreen", "Silzap", "Rebase", "Grooveware", "Kanla", "Kontrax", "Latplanet", "Hotfan", "Driptrans", "Drillla", "Stripdexon", "Qvoflex", "Openranis", "Physis", "Indigocare", "J-techi", "Hottriptech", "Ozer-holding", "Medron", "newelectrics", "Daltnix", "Green-in", "In-is", "Vivalex", "Toncore", "Linerunis", "Silverin", "Dandexon", "Labelectronics", "Ronelectronics"],
    _cnt: 100000,
    _alphaNumeric: "0123456789ABDCEDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    /*---------------------------------------------+
    | PUBLIC METHODS					           |
    +---------------------------------------------*/
    /**
     * Random value from an array
     * @param values {Array} Array to choose from
     * @returns {Object}
     */
    array: function (values) {
        return (values && values.length > 0) ? values[this.number(0, values.length - 1)] : null;
    },
    /**
     * Random number between or equal to min and max values
     * @param min {Number} The minimum value
     * @param max {Number} The maximum value
     * @param round {Boolean} If true the result is rounded. Defaults to true, set to false for decimals.
     * @returns {Number}
     */
    number: function (min, max, round) {
        if (round == null || round === true) {
            return Math.round((Math.random() * (max - min)) + min);
        }
        else {
            return (Math.random() * (max - min)) + min;
        }
    },
    /**
     * Returns a random full name from the source of available names
     * @returns {String}
     */
    fullName: function () {
        return this.array(this._names);
    },
    /**
     * Returns a random first name from the source of available names
     * @returns {String}
     */
    firstName: function () {
        var name = this.fullName();
        return name.split(" ")[0];
    },
    /**
     * Returns a random last name from the source of available names
     * @returns {String}
     */
    lastName: function () {
        var name = this.fullName();
        return name.split(" ")[1];
    },
    /**
     * Returns a random company name from the source of available companies
     * @returns {String}
     */
    companyName: function () {
        return this.array(this._companies);
    },
    /**
     * Returns an id starting at 100000 and incrementing
     * @returns {Number}
     */
    id: function () {
        this._cnt++;
        return this._cnt;
    },
    /**
     * Returns a string of random string of upper & lower case letters and numbers.
     * @param length The length the result should be. Defaults to 5
     * @returns {String}
     */
    stringHash: function (length) {
        if (length == null)
            length = 5;
        var result = "";
        for (var i = 0; i < length; i++) {
            result += this._alphaNumeric.charAt(this.number(0, this._alphaNumeric.length - 1));
        }
        return result;
    },
    /**
     * Returns a string of random numbers, not starting with 0.
     * @param length The length the result should be. Defaults to 5
     * @returns {String}
     */
    numHash: function (length) {
        if (length == null)
            length = 5;
        var source = "0123456789";
        var source2 = "123456789";
        var result = "";
        for (var i = 0; i < length; i++) {
            if (i == 0) {
                result += source2.charAt(this.number(0, source2.length - 1));
            }
            else {
                result += source.charAt(this.number(0, source.length - 1));
            }
        }
        return result;
    },
    /**
     * Returns a random date from the past.
     * @param resetTime If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateInPast: function (resetTime) {
        if (resetTime == null)
            resetTime = true;
        var d = new Date();
        d.setFullYear(this.number(1950, d.getFullYear() - 1), this.number(1, 12), this.number(1, 28));
        if (resetTime)
            d.setHours(0, 0, 0, 0);
        return d;
    },
    /**
     * Returns a random date in the future.
     * @param resetTime If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateInFuture: function (resetTime) {
        if (resetTime == null)
            resetTime = true;
        var d = new Date();
        d.setFullYear(this.number(d.getFullYear() + 1, d.getFullYear() + 50), this.number(1, 12), this.number(1, 28));
        if (resetTime)
            d.setHours(0, 0, 0, 0);
        return d;
    },
    /**
     * Returns a random date who's age is greater than minAge.
     * @param minAge {Number} The minimum age the date needs to be
     * @param resetTime {Boolean} If true the time is reset to 0 otherwise it is the same as now. Defaults to true
     * @returns {Date}
     */
    dateAge: function (minAge, resetTime) {
        if (resetTime == null)
            resetTime = true;
        var d = new Date();
        d.setFullYear(this.number(d.getFullYear() - minAge - 100, d.getFullYear() - minAge - 1), this.number(1, 12), this.number(1, 28));
        if (resetTime)
            d.setHours(0, 0, 0, 0);
        return d;
    }
};
