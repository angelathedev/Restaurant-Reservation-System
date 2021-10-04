import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListOfReservations from "../reservations/ListOfReservations";
import ListOfTables from "../tables/ListOfTables";
import { listReservations, listTables } from "../utils/api";
import { previous, next, today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {

  // if there's a date query in the URL, use that instead of the default of "today"
  const dateQuery = useQuery().get("date");
  if (dateQuery) {
    date = dateQuery;
  }

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState([]);

  // formats the date 
  const dateObj = new Date(`${date} PDT`);
  const dateString = dateObj.toDateString();

  // load reservations by date
  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboard() {
      try {
        setDashboardError([]);
        const reservationDate = await listReservations({ date }, abortController.signal);
        setReservations(reservationDate);
      } catch (error) {
        setReservations([]);
        setDashboardError([error.message]);
      }
    }
    loadDashboard();
    return () => abortController.abort();
  }, [date]);

  // load all tables
  useEffect(() => {
    const abortController = new AbortController();

    async function loadTables() {
      try {
        setDashboardError([]);
        const tableList = await listTables(abortController.signal);
        setTables(tableList);
      } catch (error) {
        setTables([]);
        setDashboardError([error.message]);
      }
    }
    loadTables();
    return () => abortController.abort();
  }, []);

   return (
     <div>
      <div>
        <h1>Dashboard</h1>
      </div>
      <ErrorAlert error={dashboardError} />
      <div className="container">
        <div class="p-3">
        <h2 className="mb-0">Reservations for {dateString}</h2>
      <div class="dates">
      <Link to={`/dashboard?date=${previous(date)}`}>
          <button className="btn btn-dark" type="button">
            &nbsp;Previous Day
          </button>
        </Link>
        <Link to={`/dashboard?date=${today()}`}>
          <button className="btn btn-dark mx-3" type="button">Today</button>
        </Link>
        <Link to={`/dashboard?date=${next(date)}`}>
          <button className="btn btn-dark" type="button">
            Next Day&nbsp;
          </button>
        </Link>
      </div>
      <div class="p-2">
      <ListOfReservations reservations={reservations} />
      </div>
      </div>
      <div></div>
      <div> 
        <h2>Tables</h2>
        <ListOfTables tables={tables}/></div>
      </div>
      </div>

  );
}

export default Dashboard;