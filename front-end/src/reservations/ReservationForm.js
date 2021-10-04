import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { postReservation, readReservation, putReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

export default function ReservationForm({ reservation_id }) {
    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
    }

    const [form, setForm] = useState({...initialFormState});
    const [reservationsError, setReservationsError] = useState([]);
   
    const history = useHistory();

    // load data to edit reservation 
    useEffect(() => {
        const abortController = new AbortController();

        if (reservation_id) {
            async function loadReservation() {
                try {
                    const reservation = await readReservation(reservation_id, abortController.status);
                    setForm(reservation);
                } catch (error) {
                    setReservationsError([error.message]);
                }
            }
            loadReservation();
        }
        return () => abortController.abort();
    }, [reservation_id]);

    const handleChange = ({ target }) => {

        let name = target.name;
        let value = target.value;
                        
        // checks that reservation date is valid
        if (name === "reservation_date") {
            const date = new Date(`${value} PDT`);
            const reservation = date.getTime();
            const now = Date.now();

            if (date.getUTCDay() === 2 && reservation < now) {
                setReservationsError([
                    "The restaurant is closed on Tuesday.", 
                    "Reservation must be in the future."
                ]);
            } else if (date.getUTCDay() === 2) {
                setReservationsError(["The restaurant is closed on Tuesday."]);
            } else if (reservation < now) {
                setReservationsError(["Reservation must be in the future."]);
            } else {
                setReservationsError([]);
            }
        }

        // checks that reservation time is valid
        if (name === "reservation_time") {
            const open = 1030;
            const close = 2130;
            const reservation = value.substring(0, 2) + value.substring(3);
            if (reservation > open && reservation < close) {
                setReservationsError([]);
            } else {
                setReservationsError(["Reservations are only allowed between 10:30am and 9:30pm."]);
            }
        }

        setForm({
            ...form,
            [target.name]: target.value,
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const abortController = new AbortController();

        // new reservation
        if (!reservation_id) {
            async function postData() {
                try {
                    await postReservation(form, abortController.signal);
                    history.push(`/dashboard?date=${form.reservation_date}`);
                } catch (error) {
                    setReservationsError([...reservationsError, error.message]);
                }
            }

            if (reservationsError.length === 0) {
                postData();
            }
        }

        // edit reservation
        if (reservation_id) {
            async function putData() {
                try {
                    setReservationsError([]);
                    await putReservation(form, abortController.signal);
                    history.push(`/dashboard?date=${form.reservation_date}`);
                } catch (error) {
                    setReservationsError([...reservationsError, error.message]);
                }
            }
            
            if (reservationsError.length === 0) {
                putData();
            }
        } 
    }
    return (
            <>
            <ErrorAlert error={reservationsError} />
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input 
                        className="form-control"
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="First Name"
                        onChange={handleChange}
                        required="required"
                        value={form.first_name}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input 
                        className="form-control"
                        type="text"
                        name="last_name"
                        id="last_name"
                        placeholder="Last Name"
                        onChange={handleChange}
                        required="required"
                        value={form.last_name}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mobile_number">Mobile Phone Number</label>
                    <input 
                        className="form-control"
                        type="text"
                        name="mobile_number"
                        id="mobile_number"
                        placeholder="555-555-5555"
                        onChange={handleChange}
                        required="required"
                        value={form.mobile_number}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reservation_date">Reservation Date</label>
                    <input 
                        className="form-control"
                        type="date"
                        name="reservation_date"
                        id="reservation_date"
                        onChange={handleChange}
                        required="required"
                        value={form.reservation_date}
                    />
                </div>
                <div className="form-group">
                <label htmlFor="reservation_time">Reservation Time</label>
                    <input 
                        className="form-control"
                        type="time"
                        name="reservation_time"
                        id="reservation_time"
                        onChange={handleChange}
                        required="required"
                        value={form.reservation_time}
                    /> 
                </div>
                <div className="form-group">
                    <label htmlFor="people">Number of People in Party</label>
                    <input 
                        className="form-control"
                        type="number"
                        name="people"
                        id="people"
                        onChange={handleChange}
                        required="required"
                        value={form.people}
                    />
                </div>
                <button className="btn btn-dark" type="submit">Submit</button>
                <button className="btn btn-dark mx-3" type="button" onClick={() => history.goBack()}>Cancel</button>
            </form>
        </>
    );

}