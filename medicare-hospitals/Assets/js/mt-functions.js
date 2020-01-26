/// <reference path = "/html/js/jquery-1.8.2.intellisense.js"/>
/// <reference path = "/html/js/knockout-2.2.0.debug.js"/>

///// Object classes

var State = function (stateName, stateAbbr) {
    this.stateName = stateName;
    this.stateAbbr = stateAbbr;
}

var Hospital = function (name, provider, phone, owner, address, city, state, zip) {
    this.hospitalName = name;
    this.providerNumber = provider;
    this.hospitalPhone = phone;
    this.hospitalOwner = owner;
    this.hospitalAddress = address;
    this.hospitalCity = city;
    this.hospitalState = state;
    this.hospitalZip = zip;

}

var hospitalsVM = {
    hospitals: []
};

var stackpage = function (pageId, pageTitle) {
    this.pageId = pageId;
    this.pageTitle = pageTitle
}

var _backstack = {stackpages:[]}

$(document).ready(function () {
    setStates();
    showStates();
    //showHospitals('AL');
});

function newHospitals() {
    var vmlen = hospitalsVM.hospitals.length;
    hospitalsVM.hospitals.splice(0, hospitalsVM.hospitals.length);
}

function setStates()
{
    var viewModel = {
        states: [
            new State("Alabama", "AL"),
            new State("Alaska", "AK"),
            new State("Arizona", "AZ"),
            new State("Arkansas", "AR"),
            new State("California", "CA"),
            new State("Colorado", "CO"),
            new State("Connecticut", "CT"),
            new State("Delaware", "DE"),
            new State("Florida", "FL"),
            new State("Georgia", "GA"),
            new State("Hawaii", "HI"),
            new State("Idaho", "ID"),
            new State("Illinois", "IL"),
            new State("Indiana", "IN"),
            new State("Iowa", "IA"),
            new State("Kansas", "KS"),
            new State("Kentucky", "KY"),
            new State("Louisiana", "LA"),
            new State("Maine", "ME"),
            new State("Maryland", "MD"),
            new State("Massachusetts", "MA"),
            new State("Michigan", "MI"),
            new State("Minnesota", "MN"),
            new State("Mississippi", "MS"),
            new State("Missouri", "MO"),
            new State("Montana", "MT"),
            new State("Nebraska", "NE"),
            new State("Nevada", "NV"),
            new State("New Hampshire ", "NH"),
            new State("New Jersey", "NJ"),
            new State("New Mexico", "NM"),
            new State("New York", "NY"),
            new State("North Carolina", "NC"),
            new State("North Dakota", "ND"),
            new State("Ohio", "OH"),
            new State("Oklahoma", "OK"),
            new State("Oregon", "OR"),
            new State("Pennsylvania", "PA"),
            new State("Rhode Island", "RI"),
            new State("South Carolina", "SC"),
            new State("South Dakota", "SD"),
            new State("Tennessee", "TN"),
            new State("Texas", "TX"),
            new State("Utah", "UT"),
            new State("Vermont", "VT"),
            new State("Virginia", "VA"),
            new State("Washington", "WA"),
            new State("West Virginia", "WV"),
            new State("Wisconsin", "WI"),
            new State("Wyoming", "WY")
        ]
    };

    ko.applyBindings(viewModel, document.getElementById("state-list"));
    setClick();
}

function setClick() {
    $('[data-clicktype]').unbind('click');
    $('[data-clicktype]').click(function () {
        itemClick($(this));
        event.preventDefault();
    });
}
function showStates() {
    pageNav(new stackpage("#state-list", "pick a state"));
}

function showAbout() {
    pageNav(new stackpage("#about-page", "about"));
}


function showHospitals(state) {
    waitOn();
    var element = $("#hospital-list");
    ko.cleanNode(element);
    var url = "http://data.medicare.gov/resource/v287-28n3.json?state=" + state + "&$order=city";
    
    $.getJSON(url)
        .done(function (json) {
            $.each(json, function () {
                //alert(this.provider_number)
                hospitalsVM.hospitals.push(new Hospital(this.hospital_name, this.provider_number, this.phone_number.phone_number, this.hospital_owner, this.address_1, this.city, this.state, this.zip_code));
            })
            //hospitalsVM.hospitals.sort(function(a,b) {
            //    return a.hospitalCity > b.hospitalCity
            //})             
            ko.applyBindings(hospitalsVM, document.getElementById("hospital-list"));
            setClick();
            pageNav(new stackpage("#hospital-list", "hospitals"));
            waitOff();
        })
        .fail(function () {
            waitOff(); 
            pageNav(new stackpage("#neterror-page", "oops!"))
        });
}


function showHospital(pnum) {
    waitOn();
    var element = $("#hospital-page");
    ko.cleanNode(element);
    var url = "http://data.medicare.gov/resource/v287-28n3.json?provider_number=" + pnum;
    var selectedHospital = hospitalsVM.hospitals.filter(function (hospital) { return hospital.providerNumber == pnum });
    var viewModel = {
        hospital: [ selectedHospital[0] ]
    };
    
    ko.applyBindings(viewModel, document.getElementById("hospital-page"));
    pageNav(new stackpage("#hospital-page", selectedHospital[0].hospitalName.toLowerCase()));
    $("#hospitalPhone").mask("(999) 999-9999");
    waitOff();
}

function showPage(pageId, pageTitle, fdirection) {
    fdirection = typeof fdirection !== 'undefined' ? fdirection : "right";
    $('html, body').animate({ scrollTop: 0 }, 0);
    $('*[data-role="page"]').hide();
    $("#page-title").html(pageTitle);
    $(pageId).show("slide", { direction: fdirection, easing: 'easeOutQuint' }, 1000);
}

function itemClick(obj) {
    if ($(obj).data('clicktype') == "state") {
        showHospitals($(obj).data('id'));
    }
    if ($(obj).data('clicktype') == "hospital") {
        showHospital($(obj).data('pnum'));
    }
}

function waitOn() {
    $('#wp-waiting').show();
}

function waitOff() {
    $('#wp-waiting').hide();
}

function pageNav(spage) {
    waitOff();
    if (spage != "null") {
        _backstack.stackpages.push(spage);
        showPage(spage.pageId, spage.pageTitle);
    }
    else {
        _backstack.stackpages.pop();
        var ln = _backstack.stackpages.length - 1;
        var pg = _backstack.stackpages[ln];
        
        //reset hospital list if going back to select a new state
        if (pg.pageId == "#state-list")
            newHospitals();
        showPage(pg.pageId, pg.pageTitle, "left");
    }

    if (_backstack.stackpages.length - 1 == 0) {
        try{
            AndroidFunction.backstackoff();
        }
        catch (err){
            window.external.notify("backstackoff");
        }
    }
    else
        try{
            AndroidFunction.backstackon();
        }
    catch(err){
        window.external.notify("backstackon");
    }
}