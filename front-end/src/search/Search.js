import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ListOfReservations from "../reservations/ListOfReservations";
import ErrorAlert from "../layout/ErrorAlert";
import { readByPhone } from "../utils/api";

export default function Search() {

    const initialFormState = {
        mobile_number: "",
    };

    const [form, setForm] = useState({...initialFormState});
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState([]);

    const history = useHistory();

    const handleChange = ({ target }) => {

        setForm({
            ...form,
            [target.name]: target.value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        // search by mobile number
        async function findByPhone() {
            try {
                const response = await readByPhone(form.mobile_number, abortController.signal);
                if (response.length === 0) {
                    setSearchResults(["No reservations found"]);
                } else {
                    setSearchResults(response);
                }
            } catch (error) {
                setSearchError([...searchError, error.message]);
            }
        }

        if (searchError.length === 0) {
            findByPhone();
        }
    };

    return (
        <>
            <div>
                <h1>Search for Reservation by Phone Number</h1>
            </div>
            <ErrorAlert error={searchError} />
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="mobile_number">Mobile Number</label>
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
                <button className="btn btn-dark mb-3" type="submit">Search</button>
                <button className="btn btn-dark mx-3 mb-3" type="button" onClick={() => history.goBack()}>Cancel</button>
            </form>
            {searchResults[0] === "No reservations found" ? <h4>{searchResults[0]}</h4> : (
                <ListOfReservations reservations={searchResults} />
            )}
        </>
    );
}
