import React from "react";
// using getRequests as stated in instructions
import { getRequests } from "./Api";

// using antd framework for additional ui and css presentation
import "antd/dist/antd.css";
import {
  Table,
  Header,
  Row,
  Col,
  Layout,
  Select,
  Button,
  Icon,
  Popover
} from "antd";

// using lodash (commonly known as _) for functions such as _.sortBy, etc to easily sort dates, etc.
import * as _ from "lodash";

// typically if a tsx file was used this would be an enum,
// but this ican serve its purpose the same way.
const StatusModel = {
  All: "All",
  Pending: "Pending",
  Approved: "Approved",
  Denied: "Denied"
};
// each individual listing item
class ListingItem {
  id: number;
  title: string;
  updated_at: string;
  created_at: string;
  status: StatusModel;
}
// overall listing state
class ListingStateModel {
  listingData: Array<ListingItem>;
  filteredListing: Array<ListingItem>;
  isLoading: boolean;
  listingFilter: StatusModel;
  constructor() {
    // intialize all defaul values on new signature
    this.listingData = []; // in typescript these would be typed
    this.filteredListing = []; // in type script these would be typed
    this.isLoading = true;
    this.listingFilter = StatusModel.All; // filter all satus from the jump
  }
}

export class Requests extends React.Component<{}, ListingStateModel> {
  constructor(props: ListingStateModel) {
    super(props);
    this.state = {
      // initially spread a new listing state model...
      ...new ListingStateModel()
    };
  }

  /**
   *  Setup state, mapping the requests data status property to cast to the StatusModel enum
   *  while sorting dates and formatting/preparing the dates and setting the listing filters inital state to All.
   *  @returns {void} void
   * */
  componentDidMount() {
    getRequests().then((data: Array<ListingItem>) => {
      const listingData = this.prepDates(data);
      const filteredListing = this.sortListing(listingData);
      this.setState({
        listingData,
        filteredListing,
        isLoading: false,
        listingFilter: StatusModel.All
      });
    });
  }

  /**
   * Updates the listing filter driven by dropdown
   *  @returns {void} void
   * */
  refreshFilter = (model: StatusModel) => {
    const refreshedData = _.filter(
      this.state.listingData,
      (item: ListingItem) =>
        model === StatusModel.All ? !!item : item.status === model
    );
    const filteredListing = this.sortListing(refreshedData);
    this.setState({
      filteredListing,
      listingFilter: model
    });
  };

  /**
   * Sorts the Listing Data ascendingly based on the updated_at key
   * @returns {Array<ListingItem>} Sorted collection of listing items
   */
  sortListing = (data: Array<ListingItem>): Array<ListingItem> => {
    // use lodash to sort the data based on a key in the array
    return _.sortBy(data, "updated_at");
  };

  /**
   * Parse the date values into %y-%m-%d
   * @returns {Array<ListingItem>} Modified collection of listing items with formatted date fields in %Y-%M-%D
   */
  prepDates = (data: Array<ListingItem>): Array<ListingItem> => {
    return data.map((item: ListingItem) => {
      const parsedUpdateDate = new Date(item.updated_at);
      // this might seem sloppy but i have two turnaries here because if the day of the week is less than 10, i need to append a 0 to it.
      // i tried to reduce lines of code necessary here to construct the date in the required format
      const lastUpdated = `${parsedUpdateDate.getFullYear()}-${
        parsedUpdateDate.getMonth() + 1 < 10
          ? `0${parsedUpdateDate.getMonth() + 1}`
          : parsedUpdateDate.getMonth() + 1
      }-${
        parsedUpdateDate.getDate() < 10
          ? `0${parsedUpdateDate.getDate()}`
          : parsedUpdateDate.getDate()
      }`;

      const parsedCreatedDate = new Date(item.created_at);
      const createdDate = `${parsedCreatedDate.getFullYear()}-${
        parsedCreatedDate.getMonth() + 1 < 10
          ? `0${parsedCreatedDate.getMonth() + 1}`
          : parsedCreatedDate.getMonth() + 1
      }-${
        parsedCreatedDate.getDate() < 10
          ? `0${parsedCreatedDate.getDate()}`
          : parsedCreatedDate.getDate()
      }`;
      return {
        ...item,
        updated_at: lastUpdated,
        created_at: createdDate
      };
    });
  };

  /**
   * Updates the status property of a listing item,
   * and then re-sorts the listing after updating the listing items updated_at property
   * @returns {void} void
   */
  refreshStatus = (id: number, model: StatusModel): void => {
    let date = new Date();
    const updatedAt = `${date.getFullYear()}-${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
    let listingFilter: StatusModel = this.state.listingFilter;
    // first update the states listing data, so we can filter the listing again with the new status.
    const listingData = this.state.listingData.map((item: ListingItem) => {
      if (item.id === id) {
        // we need this status to sort the filtered listing after updating
        // the items new status to maintain the filter the user currently shows
        listingFilter =
          listingFilter !== StatusModel.All ? item.status : StatusModel.All;
        return {
          ...item,
          updated_at: updatedAt,
          status: model
        };
      } else {
        return item;
      }
    });
    // now filter the listing with the updated listing data, and sort it.
    const filteredListing = this.sortListing(
      listingData.filter((item: ListingItem) => {
        return listingFilter === StatusModel.All
          ? item
          : item.status === listingFilter;
      })
    );
    this.setState({
      listingData,
      filteredListing,
      listingFilter
    });
  };

  /**
   * Deletes a listing record and refreshes the data in the state
   * while removing the record from the listing visually and sorting the new set of
   * filtered data
   * @returns {void} void
   */
  refreshListing = (id: number) => {
    // delete the item from the state's listing data
    const listingData = this.state.listingData.filter(
      (item: ListingItem) => item.id !== id
    );
    // delete the item from the current filtered listing and sort the new data
    const filteredListing = this.sortListing(
      this.state.filteredListing.filter((item: ListingItem) => item.id !== id)
    );
    this.setState({
      listingData,
      filteredListing
    });
  };

  /**
   * Table column structure
   */
  tableRows = [
    {
      title: "Title",
      dataIndex: "title",
      dataKey: "title",
      rowKey: "id"
    },
    {
      title: "Status",
      dataIndex: "status",
      dataKey: "status",
      rowKey: "id",
      render: (listingStatus: StatusModel, listingItem: ListingItem) => (
        <Popover
          title="Update Status"
          content={
            <Row>
              <Col>
                <Select
                  style={{
                    width: 120,
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  defaultValue={listingStatus}
                  onChange={value =>
                    this.refreshStatus(
                      listingItem.id,
                      StatusModel[value.toString()]
                    )
                  }
                >
                  <Select.Option value={StatusModel.Approved}>
                    Approved
                  </Select.Option>
                  <Select.Option value={StatusModel.Denied}>
                    Denied
                  </Select.Option>
                  <Select.Option value={StatusModel.Pending}>
                    Pending
                  </Select.Option>
                </Select>
              </Col>
            </Row>
          }
        >
          <a className="ant-dropdown-link">
            {listingStatus} <Icon type="down" />
          </a>
        </Popover>
      )
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      dataKey: "updated_at",
      rowKey: "id"
    },
    {
      title: "Created",
      dataIndex: "created_at",
      dataKey: "created_at",
      rowKey: "id"
    },
    {
      title: "delete",
      dataIndex: "delete",
      dataKey: "delete",
      rowKey: "id",
      render: (action: any, item: ListingItem) => (
        <Button type={"primary"} onClick={() => this.refreshListing(item.id)}>
          Delete
        </Button>
      )
    }
  ];

  render() {
    return (
      <Layout>
        <Layout.Header
          style={{
            textAlign: "center",
            lineHeight: "normal",
            display: "flex",
            justifyContent: "center",
            flexFlow: "column nowrap",
            alignItems: "baseline"
          }}
        >
          <Row type={"flex"} justify={"space-between"}>
            <Col style={{ marginRight: "20px" }}>
              <h1 style={{ color: "white" }}>Requests</h1>
            </Col>

            <Col>
              <h4 style={{ color: "white", textAlign: "center" }}>
                Filter by Status:
              </h4>
              <Select
                style={{ width: 150, display: "inline-block" }}
                defaultValue={StatusModel.All}
                onChange={selection =>
                  this.refreshFilter(StatusModel[selection.toString()])
                }
              >
                <Select.Option value="All">All</Select.Option>
                <Select.Option value="Approved">Approved</Select.Option>
                <Select.Option value="Denied">Denied</Select.Option>
                <Select.Option value="Pending">Pending</Select.Option>
              </Select>
            </Col>
          </Row>
        </Layout.Header>

        <Layout.Content>
          <Table
            loading={this.state.isLoading}
            columns={this.tableRows}
            key={"id"}
            rowKey={"id"}
            bordered={true}
            dataSource={this.state.filteredListing}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default Requests;
